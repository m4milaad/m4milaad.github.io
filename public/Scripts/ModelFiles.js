// Positions use X across the keyboard, Y up and Z towards the front edge.
// A single static buffer holds the shells, bevels, keycaps, vents and decals.
function buildLegionMesh() {
    const vertices = [];
    const atlas = document.createElement("canvas");
    atlas.width = 2048;
    atlas.height = 1024;
    const ink = atlas.getContext("2d");
    const graphite = [0.28, 0.29, 0.33];
    const charcoal = [0.075, 0.08, 0.095];
    const inset = [0.038, 0.042, 0.05];
    const silver = [0.49, 0.51, 0.55];
    const white = [1, 1, 1];
    let transform = point => point;
    let labelCount = 0;

    function triangle(a,b,c,color,mode=0,uv=[[0,0],[0,0],[0,0]]) {
        const points = [a,b,c].map(transform);
        const u = points[1].map((v,i)=>v-points[0][i]);
        const v = points[2].map((v,i)=>v-points[0][i]);
        const cross = [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]];
        const length = Math.hypot(...cross);
        if (!length) return;
        const normal = cross.map(n=>n/length);
        points.forEach((point,i)=>vertices.push(...point,...normal,...color,...uv[i],mode));
    }
    // Rounded rectangular cross sections joined in height order. The inset
    // of each ring gives the rim and key skirts real sloping faces.
    function solid(x,z,w,d,radius,rings,color) {
        const outlines = rings.map(([y,inset])=>{
            const halfW = w/2-inset, halfD = d/2-inset;
            const r = Math.min(radius,halfW,halfD);
            const points = [];
            for (let corner=0;corner<4;corner++) {
                const cx = x + (corner===0 || corner===3 ? 1 : -1)*(halfW-r);
                const cz = z + (corner<2 ? -1 : 1)*(halfD-r);
                for (let i=0;i<=4;i++) {
                    const angle = (corner+i/4)*Math.PI/2;
                    points.push([cx+r*Math.cos(angle),y,cz-r*Math.sin(angle)]);
                }
            }
            return points;
        });
        const first=outlines[0], last=outlines[outlines.length-1];
        for(let i=0;i<first.length;i++) {
            const j=(i+1)%first.length;
            triangle([x,last[i][1],z],last[i],last[j],color);
            triangle([x,first[i][1],z],first[j],first[i],color);
            for(let k=1;k<outlines.length;k++) {
                const low=outlines[k-1], high=outlines[k];
                triangle(low[i],low[j],high[j],color);
                triangle(low[i],high[j],high[i],color);
            }
        }
    }
    function slab(x,y,z,w,h,d,color,r=0.025) {
        solid(x,z,w,d,r,[[y,0],[y+h,0]],color);
    }
    function decal(x,y,z,w,d,mode,uv,rotate=false) {
        let points=[[x-w/2,y,z-d/2],[x-w/2,y,z+d/2],[x+w/2,y,z+d/2],[x+w/2,y,z-d/2]];
        if(rotate) points=points.slice(1).concat([points[0]]);
        for(const indices of [[0,1,2],[0,2,3]]) {
            triangle(...indices.map(i=>points[i]),white,mode,indices.map(i=>uv[i]));
        }
    }
    function print(text,x,y,z,w,d,rotate=false) {
        if (!text) return;
        const col=labelCount%16, row=Math.floor(labelCount++/16);
        const px=col*128, py=row*128;
        ink.fillStyle="#eef1f7";
        ink.font="600 76px Arial";
        ink.textAlign="center";
        ink.textBaseline="middle";
        ink.fillText(text,px+64,py+64,122);
        const uv=[[0,0],[0,128],[128,128],[128,0]].map(([u,v])=>[(px+u)/2048,(py+v)/1024]);
        decal(x,y,z,w,d,1,uv,rotate);
    }

    // Lower shell, narrow polished perimeter and the anodized palm rest.
    solid(0,0,3.7,2.55,0.065,[[-0.18,0.09],[-0.13,0.025],[-0.057,0]],charcoal);
    solid(0,0,3.7,2.55,0.061,[[-0.056,0.002],[-0.040,0],[-0.029,0.013]],silver);
    solid(0,0,3.7,2.55,0.06,[[-0.029,0.005],[0,0.024]],graphite);
    slab(0,0.001,-0.295,3.45,0.008,1.15,inset,0.04);
    slab(-0.41,0.001,0.787,1.30,0.003,0.78,charcoal);
    slab(-0.41,0.005,0.787,1.286,0.002,0.764,[0.263,0.273,0.313]);
    slab(1.72,0.002,0.95,0.10,0.004,0.35,[0.40,0.42,0.47],0.009);
    print("Lenovo",1.72,0.008,0.95,0.10,0.32,true);

    const unit=0.18;
    function key(x,z,w,d,label) {
        solid(x,z,w,d,0.018,[[0.009,0.004],[0.021,0],[0.040,0.006]],[0.33,0.35,0.39]);
        solid(x,z,w-0.009,d-0.009,0.015,[[0.022,0],[0.046,0.009],[0.050,0.015]],charcoal);
        print(label,x,0.052,z,Math.min(w-0.024,label.length>2?0.20:0.092),Math.min(0.15,d-0.01));
    }
    const plain = text=>text.split(' ').map(label=>[label,1]);
    const rows=[
        [['Esc',1],...Array.from({length:12},(_,i)=>['F'+(i+1),1]),['Delete',1.5]],
        [...plain('~ 1 2 3 4 5 6 7 8 9 0 - ='),['Backspace',1.5]],
        [['Tab',1.4],...plain('Q W E R T Y U I O P [ ]'),['\\',1.1]],
        [['CapsLk',1.7],...plain("A S D F G H J K L ; '"),['Enter',1.8]],
        [['Shift',2.2],...plain('Z X C V B N M , . /'),['Shift',2.3]],
        [['Ctrl',1.2],['Fn',1],['⊞',1],['Alt',1],['',5.65],['Alt',1],['Ctrl',1]]
    ];
    rows.forEach((row,i)=>{
        let left=-1.70;
        for(const [label,units] of row) {
            const width=units*unit;
            key(left+width/2,-0.79+i*0.187,width-0.012,i===0?0.135:0.172,label);
            left+=width;
        }
    });
    const pad=[['Home','End','PgUp','PgDn'],['Num','/','*','−'],['7','8','9','+'],['4','5','6',''],['1','2','3','Enter'],['0','','.','']];
    pad.forEach((row,i)=>row.forEach((label,j)=>{
        if (!label) return;
        const wide=label==='0', tall=label==='+' || label==='Enter';
        key(1.03+j*unit+(wide?0.09:0),-0.79+i*0.187+(tall?0.0935:0),
            wide?0.347:0.168,tall?0.358:(i===0?0.135:0.172),label);
    }));
    key(0.73,0.145,0.168,0.172,'↑');
    ['←','↓','→'].forEach((label,i)=>key(0.55+i*unit,0.332,0.168,0.172,label));
    slab(0,0.002,-0.982,0.066,0.008,0.066,charcoal,0.032);
    slab(0,0.011,-0.982,0.018,0.002,0.018,white,0.009);
    for(const side of [-1,1]) {
        slab(side*1.45,0,-1.09,0.29,0.115,0.14,charcoal);
        for(let i=0;i<11;i++) slab(side*1.839,-0.108,-0.99+i*0.052,0.015,0.044,0.027,inset,0.002);
        for(const z of [-0.23,0.13]) slab(side*1.839,-0.106,z,0.015,0.040,0.14,inset,0.003);
        for(let i=0;i<15;i++) slab(side*(0.61+i*0.07),-0.11,-1.262,0.043,0.05,0.012,inset,0.003);
    }

    // Construct the lid as a second solid in its own hinged coordinate system.
    const angle=0.115;
    transform=([x,y,z])=>[x,0.10-z*Math.cos(angle)+y*Math.sin(angle),
        -1.08+z*Math.sin(angle)+y*Math.cos(angle)];
    solid(0,-1.137,3.67,2.274,0.047,[[-0.072,0.021],[-0.060,0],[-0.012,0],[0,0.009]],charcoal);
    slab(0,-0.04,-2.272,0.81,0.040,0.048,charcoal);
    slab(0,0.001,-2.25,0.025,0.004,0.025,[0.13,0.19,0.24],0.012);
    decal(0,0.002,-1.197,3.56,2.00,2,[[0,0],[0,1],[1,1],[1,0]]);
    print('LEGION',0,0.003,-0.099,0.39,0.13);
    return {vertices:new Float32Array(vertices),atlas};
}

function createLegionRenderer(canvas) {
    const gl=canvas.getContext('webgl2',{alpha:false,antialias:true});
    const vertex=`#version 300 es
        layout(location=0) in vec3 position;
        layout(location=1) in vec3 normal;
        layout(location=2) in vec3 material;
        layout(location=3) in vec2 uv;
        layout(location=4) in float surface;
        uniform vec2 viewport;
        uniform vec2 orbit;
        out vec3 tint;
        out vec3 viewNormal;
        out vec3 viewPosition;
        out vec2 texCoord;
        flat out int surfaceType;
        vec3 rotateView(vec3 p) {
            float c=cos(orbit.x), s=sin(orbit.x);
            p.xz=mat2(c,-s,s,c)*p.xz;
            c=cos(orbit.y); s=sin(orbit.y);
            p.yz=mat2(c,s,-s,c)*p.yz;
            return p;
        }
        void main() {
            viewPosition=rotateView(position-vec3(0.,0.85,0.));
            viewNormal=rotateView(normal);
            float distance=8.0-viewPosition.z;
            float turn = min(1., abs(sin(orbit.x)) + abs(orbit.y - 0.28));
            float focal = min(4.20 - 1.10*turn, viewport.x/viewport.y*(3.05 - 0.45*turn));
            gl_Position=vec4(viewPosition.xy*focal*vec2(viewport.y/viewport.x,1.),
                             distance*1.02-0.81,distance);
            tint=material; texCoord=uv; surfaceType=int(surface);
        }`;
    const fragment=`#version 300 es
        precision highp float;
        in vec3 tint;
        in vec3 viewNormal;
        in vec3 viewPosition;
        in vec2 texCoord;
        flat in int surfaceType;
        uniform sampler2D legends;
        uniform sampler2D terminal;
        out vec4 color;
        void main() {
            if(surfaceType==2) {color=vec4(texture(terminal,texCoord).rgb,1.);return;}
            if(surfaceType==1) {
                vec4 ink=texture(legends,texCoord);
                if(ink.a<0.2) discard;
                color=vec4(ink.rgb,ink.a);return;
            }
            vec3 n=normalize(viewNormal);
            vec3 light=normalize(vec3(-0.45,0.85,0.65));
            vec3 eye=normalize(vec3(0.,0.,8.)-viewPosition);
            float diffuse=max(dot(n,light),0.);
            float highlight=pow(max(dot(n,normalize(light+eye)),0.),36.);
            float rim=pow(1.-max(dot(n,eye),0.),4.);
            color=vec4(tint*(0.57+0.64*diffuse)+0.13*highlight+vec3(0.038,0.043,0.056)*rim,1.);
        }`;
    const program=gl.createProgram();
    gl.attachShader(program,LoadShader(gl,gl.VERTEX_SHADER,vertex));
    gl.attachShader(program,LoadShader(gl,gl.FRAGMENT_SHADER,fragment));
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const mesh=buildLegionMesh();
    gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER,mesh.vertices,gl.STATIC_DRAW);
    const stride=12;
    let offset=0;
    [3,3,3,2,1].forEach((size,index)=>{
        gl.enableVertexAttribArray(index);
        gl.vertexAttribPointer(index,size,gl.FLOAT,false,stride*4,offset*4);
        offset+=size;
    });
    function texture(name,unit,source) {
        const handle=gl.createTexture();
        gl.activeTexture(gl.TEXTURE0+unit);
        gl.bindTexture(gl.TEXTURE_2D,handle);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.uniform1i(gl.getUniformLocation(program,name),unit);
        return handle;
    }
    texture('legends',0,mesh.atlas);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
    const display=document.createElement('canvas');
    display.width=1448; display.height=818;
    const ctx=display.getContext('2d');
    const lcd=texture('terminal',1,display);
    const viewport=gl.getUniformLocation(program,'viewport');
    const orbit=gl.getUniformLocation(program,'orbit');
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    let previousText=null;
    return function draw(text,elevation,yaw) {
        const density=Math.min(window.devicePixelRatio||1,2);
        const w=Math.round(canvas.clientWidth*density), h=Math.round(canvas.clientHeight*density);
        if(canvas.width!==w || canvas.height!==h) {canvas.width=w;canvas.height=h;}
        if(previousText!==text) {
            ctx.fillStyle='#080c12'; ctx.fillRect(0,0,display.width,display.height);
            ctx.font='24px monospace'; ctx.fillStyle='#ceebff';
            text.split('\n').forEach((line,i)=>ctx.fillText(line,28,32+i*26));
            gl.bindTexture(gl.TEXTURE_2D,lcd);
            gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,display);
            previousText=text;
        }
        gl.viewport(0,0,w,h);
        gl.clearColor(0.095,0.097,0.105,1);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        gl.uniform2f(viewport,w,h);
        gl.uniform2f(orbit,yaw,0.28+elevation);
        gl.drawArrays(gl.TRIANGLES,0,mesh.vertices.length/stride);
    };
}
