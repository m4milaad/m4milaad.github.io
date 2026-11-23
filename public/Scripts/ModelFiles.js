// X spans the keyboard, Y points up, and positive Z is the front edge.
// Vertices are interleaved position, face normal, tint, UV, and material ID.
function buildLegionMesh() {
    const vertices = [];
    const atlas = document.createElement("canvas");
    atlas.width = atlas.height = 2048;
    const ink = atlas.getContext("2d");
    const cells = new Map();
    const white = [1, 1, 1];
    const blankUV = [[0, 0], [0, 0], [0, 0]];
    // Match the 19.9–24.05 mm closed shell taper, keeping the display rigid as it opens.
    const thicknessScale = 0.83;
    let transform = ([x,y,z]) => [x, y*thicknessScale, z];

    function triangle(a, b, c, color, mode = 0, uv = blankUV) {
        const points = [transform(a), transform(b), transform(c)];
        const [p, q, r] = points;
        const ux = q[0]-p[0], uy = q[1]-p[1], uz = q[2]-p[2];
        const vx = r[0]-p[0], vy = r[1]-p[1], vz = r[2]-p[2];
        const nx = uy*vz-uz*vy, ny = uz*vx-ux*vz, nz = ux*vy-uy*vx;
        const length = Math.hypot(nx, ny, nz);
        if (!length) return;
        for (let i = 0; i < 3; i++) {
            vertices.push(...points[i], nx/length, ny/length, nz/length, ...color, ...uv[i], mode);
        }
    }

    function roundedOutline(x, y, z, w, d, radius) {
        const r = Math.min(radius, w/2, d/2);
        const points = [];
        for (let corner = 0; corner < 4; corner++) {
            const cx = x + (corner === 0 || corner === 3 ? 1 : -1)*(w/2-r);
            const cz = z + (corner < 2 ? -1 : 1)*(d/2-r);
            for (let i = 0; i <= 5; i++) {
                const angle = (corner+i/5)*Math.PI/2;
                points.push([cx+r*Math.cos(angle), y, cz-r*Math.sin(angle)]);
            }
        }
        return points;
    }
    function joinOutlines(low, high, color, mode = 0) {
        for (let i = 0; i < low.length; i++) {
            const j = (i+1)%low.length;
            triangle(low[i], low[j], high[j], color, mode);
            triangle(low[i], high[j], high[i], color, mode);
        }
    }
    // Profile rings describe the bevels of each rounded rectangular shell.
    function solid(x, z, w, d, radius, rings, color, mode = 0) {
        const outlines = rings.map(([y,inset]) => roundedOutline(x,y,z,w-2*inset,d-2*inset,radius));
        const first = outlines[0], last = outlines[outlines.length-1];
        for (let i = 0; i < first.length; i++) {
            const j = (i+1)%first.length;
            triangle([x,last[i][1],z], last[i], last[j], color, mode);
            triangle([x,first[i][1],z], first[j], first[i], color, mode);
        }
        for (let k = 1; k < outlines.length; k++) joinOutlines(outlines[k-1],outlines[k],color,mode);
    }
    function slab(x, y, z, w, h, d, color, r = 0.025, mode = 0) {
        solid(x, z, w, d, r, [[y,0],[y+h,0]], color, mode);
    }
    function mappedQuad(points, mode, uv) {
        for (const indices of [[0,1,2], [0,2,3]]) {
            triangle(...indices.map(i => points[i]), white, mode, indices.map(i => uv[i]));
        }
    }
    function decal(x, y, z, w, d, mode, uv, rotate = false) {
        const points = [[x-w/2,y,z-d/2],[x-w/2,y,z+d/2],[x+w/2,y,z+d/2],[x+w/2,y,z-d/2]];
        if (rotate) points.push(points.shift());
        mappedQuad(points, mode, uv);
    }
    function labelUV(key, draw) {
        if (cells.has(key)) return cells.get(key);
        const size = 128;
        const x = (cells.size%16)*size, y = Math.floor(cells.size/16)*size;
        if (y >= atlas.height) throw new Error("Legion label atlas is full");
        ink.save();
        ink.beginPath();
        ink.rect(x, y, size, size);
        ink.clip();
        // A transparent gutter keeps neighboring glyphs apart in the mip chain.
        draw(ink, x+3, y+3, size-6);
        ink.restore();
        const uv = [[3,3],[3,125],[125,125],[125,3]].map(([u,v]) => [(x+u)/atlas.width, (y+v)/atlas.height]);
        cells.set(key, uv);
        return uv;
    }
    function typeUV(text, color) {
        return labelUV(text+color, (g, x, y, size) => {
            // Write at the physical aspect ratio when this square is laid onto the tag.
            g.fillStyle = color;
            g.font = "bold 100px Arial, sans-serif";
            g.textBaseline = "alphabetic";
            const metrics = g.measureText(text);
            const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
            g.translate(x, y);
            g.scale(size/(metrics.width+4), size/(height+6));
            g.fillText(text, 2, metrics.actualBoundingBoxAscent+3);
        });
    }
    function print(text, x, y, z, w, d, rotate = false, color = "#eff3fa") {
        decal(x, y, z, w, d, 1, typeUV(text, color), rotate);
    }

    // Vector inlays stay sharp at grazing angles. The three gaps around the O
    // are part of the Legion wordmark and remain visible on the lid foil.
    function legionMark(origin, across, down, tint, mode = 3) {
        const point = (x,y) => origin.map((v,i) => v + across[i]*x/6.25 + down[i]*y);
        function quad(a,b,c,d) {
            triangle(point(...a), point(...c), point(...b), tint, mode);
            triangle(point(...a), point(...d), point(...c), tint, mode);
        }
        function bar(x,y,w,h) { quad([x,y],[x+w,y],[x+w,y+h],[x,y+h]); }
        function arc(x,start,end) {
            const segments = Math.ceil((end-start)/10);
            const at = (angle,r) => [x+Math.cos(angle)*r, 0.50+Math.sin(angle)*r];
            for (let i=0; i<segments; i++) {
                const a = (start + (end-start)*i/segments)*Math.PI/180;
                const b = (start + (end-start)*(i+1)/segments)*Math.PI/180;
                quad(at(a,0.50),at(b,0.50),at(b,0.307),at(a,0.307));
            }
        }
        bar(0,0,0.20,1); bar(0.20,0.80,0.59,0.20);
        bar(0.96,0,0.20,1); bar(1.16,0,0.62,0.20);
        bar(1.16,0.40,0.52,0.19); bar(1.16,0.80,0.62,0.20);
        arc(2.48,0,322); bar(2.48,0.46,0.50,0.17);
        bar(3.22,0,0.21,1);
        for (const [a,b] of [[-145,-30],[-23,88],[96,209]]) arc(4.17,a,b);
        bar(4.91,0,0.20,1); bar(5.83,0,0.20,1);
        quad([5.11,0],[5.83,0.70],[5.83,1],[5.11,0.30]);
    }

    const frontZ = 1.275;
    const pivotY = 0.044, pivotZ = -1.047;
    const parts = { triangle, solid, slab, decal, print, labelUV, legionMark, frontZ, pivotY, pivotZ };
    buildLegionChassis(parts);
    buildLegionKeyboard(parts);

    const lidVertexStart = vertices.length/12;
    const hingePivot = [0, pivotY*thicknessScale, pivotZ];
    const lidAngle = 112 * Math.PI/180;
    const sin = Math.sin(lidAngle), cos = Math.cos(lidAngle);
    // Local +Y faces the viewer, while -Z runs from the hinge to the webcam.
    transform = ([x,y,z]) => [x, hingePivot[1]-z*sin-y*thicknessScale*cos, hingePivot[2]-z*cos+y*thicknessScale*sin];
    const cover = [0.29,0.309,0.345], bezel = [0.078,0.080,0.094];
    // The dark clutch cover fills the run between the two recessed hinge knuckles.
    for (let i = 0; i < 24; i++) {
        const a = i*Math.PI/12, b = (i+1)*Math.PI/12;
        const at = (x, angle) => [x, -0.004+0.034*Math.cos(angle), 0.034*Math.sin(angle)];
        const left = -1.30, right = 1.30;
        triangle(at(left,a),at(left,b),at(right,b),bezel);
        triangle(at(left,a),at(right,b),at(right,a),bezel);
        triangle([left,-0.004,0],at(left,b),at(left,a),bezel);
        triangle([right,-0.004,0],at(right,a),at(right,b),bezel);
    }
    const lidDepth = frontZ - pivotZ - 0.002;
    const lidWidth = 3.698;
    solid(0,-lidDepth/2,lidWidth,lidDepth,0.067,[[-0.067,0.022],[-0.062,0.007],[-0.051,0],[-0.004,0]],cover,3);
    solid(0,-lidDepth/2,lidWidth-0.004,lidDepth-0.004,0.065,[[-0.004,0],[-0.002,0.001],[0,0.006]],bezel);

    // A hollow return runs around the bezel. Its narrow rubber land seats
    // on the bare deck while the glass clears the keys inside the opening.
    const hingeClearance = 0.037;
    function rim(y, inset) {
        return roundedOutline(0,y,-(lidDepth+hingeClearance)/2,lidWidth-2*inset,
            lidDepth-hingeClearance-2*inset,0.067-inset);
    }
    const flange = rim(-0.001,0.009);
    const shoulder = rim(pivotY-0.009,0.013);
    const seatOuter = rim(pivotY+0.0004,0.018);
    const seatInner = rim(pivotY+0.0004,0.023);
    const innerWall = rim(0.002,0.030);
    const seal = [0.054,0.057,0.064];
    joinOutlines(flange,shoulder,cover,3);
    joinOutlines(shoulder,seatOuter,seal,4);
    joinOutlines(seatOuter,seatInner,seal,4);
    joinOutlines(seatInner,innerWall,bezel);
    joinOutlines(innerWall,rim(-0.001,0.031),bezel);

    const displayZ = -lidDepth + 1.084;
    solid(0,displayZ,3.586,2.028,0.018,[[0.0003,0],[0.002,0.005]], [0.037,0.038,0.044]);
    decal(0,0.0023,displayZ,3.566,3.566*9/16,2,[[0,0],[0,1],[1,1],[1,0]]);
    // The raised center lip is continuous with the cover around the camera.
    solid(0,-lidDepth+0.031,0.96,0.071,0.025,[[-0.056,0.011],[-0.050,0],[-0.012,0],[-0.004,0.007]],cover,3);
    solid(0,-lidDepth+0.036,0.935,0.081,0.017,[[-0.003,0],[0.001,0.006]],bezel);
    const cameraZ = -lidDepth+0.053;
    slab(0,0.002,cameraZ,0.043,0.002,0.043,[0.038,0.040,0.047],0.021);
    slab(0,0.0041,cameraZ,0.027,0.0015,0.027,[0.108,0.137,0.153],0.013);
    slab(-0.004,0.0057,cameraZ-0.005,0.008,0.0008,0.008,[0.30,0.39,0.49],0.004);
    for (const x of [-0.30,0.30]) slab(x,0.0013,cameraZ,0.012,0.001,0.012,[0.028,0.029,0.035],0.006);
    legionMark([-0.195,0.0007,-0.135], [0.39,0,0], [0,0,0.060], [0.45,0.46,0.48]);
    // Viewed from behind, the L starts toward the hinge and the N ends
    // about 14 mm from the webcam edge. The letter tops face the left edge.
    const foilOrigin = [lidWidth/2 - 0.132, -0.0676, -lidDepth + 1.000];
    legionMark(foilOrigin, [0,0,-0.890], [-0.151,0,0], [0.40,0.43,0.46], 6);
    // The small, vertical Lenovo maker's plate is on the opposite rear corner.
    solid(-1.733,-0.281,0.106,0.329,0.005,[[-0.071,0.003],[-0.069,0],[-0.0671,0]], [0.60,0.615,0.64],3);
    const tagX=-1.733, tagZ=-0.281, tagY=-0.0713;
    mappedQuad([[tagX+0.034,tagY,tagZ+0.136],[tagX-0.034,tagY,tagZ+0.136],
                [tagX-0.034,tagY,tagZ-0.136],[tagX+0.034,tagY,tagZ-0.136]],1,typeUV("Lenovo","#202128"));
    const floorPlane = [0.026*thicknessScale, -0.190*thicknessScale];
    return { vertices: new Float32Array(vertices), atlas, lidVertexStart, hingePivot, lidAngle, floorPlane };
}
