// The chassis and lid share a static vertex buffer. Only the lid transform,
// camera and display content change when the visitor operates the laptop.
function createLegionRenderer(canvas) {
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: true, depth: true });
    if (!gl) return null;

    const mesh = buildLegionMesh();
    const stride = 12;
    const count = mesh.vertices.length / stride;
    const lidStart = mesh.lidVertexStart;
    const pivot = mesh.hingePivot;
    const lidAngle = mesh.lidAngle;
    const shadowSize = 2048;
    const display = document.createElement("canvas");
    display.width = 1448;
    display.height = 818;
    const terminal = display.getContext("2d", { alpha: false });

    function hinge(point, radians) {
        const y = point[1] - pivot[1], z = point[2] - pivot[2];
        const c = Math.cos(radians), s = Math.sin(radians);
        return [point[0], pivot[1] + c*y - s*z, pivot[2] + s*y + c*z];
    }

    // Bound the two pieces separately in their respective flat orientations.
    // This keeps the projected framing accurate when the lid swings shut.
    function bounds(start, end, angle) {
        const min = [Infinity, Infinity, Infinity], max = min.map(() => -Infinity);
        for (let i = start * stride; i < end * stride; i += stride) {
            const p = [mesh.vertices[i], mesh.vertices[i+1], mesh.vertices[i+2]];
            const xyz = angle ? hinge(p, angle) : p;
            for (let axis = 0; axis < 3; axis++) {
                min[axis] = Math.min(min[axis], xyz[axis]);
                max[axis] = Math.max(max[axis], xyz[axis]);
            }
        }
        const corners = [];
        if (start < end) {
            for (const x of [min[0], max[0]]) for (const y of [min[1], max[1]]) {
                for (const z of [min[2], max[2]]) corners.push([x,y,z]);
            }
        }
        return { corners, min, max };
    }
    const base = bounds(0, lidStart, 0);
    const lid = bounds(lidStart, count, lidAngle);
    const dot = (a,b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];

    function cameraFrame(aspect, elevation, yaw, open, zoom) {
        const azimuth = 0.90 - yaw;
        const pitch = Math.max(-1.54, Math.min(1.54, 0.22 + elevation));
        const ca = Math.cos(azimuth), sa = Math.sin(azimuth);
        const cp = Math.cos(pitch), sp = Math.sin(pitch);
        const right = [ca, 0, -sa], up = [-sa*sp, cp, -ca*sp], back = [sa*cp, sp, ca*cp];
        const distance = 16.7;
        const eye = [distance*back[0], 0.78 + distance*back[1], distance*back[2]];
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        const corners = base.corners.concat(lid.corners.map(p => hinge(p, -open*lidAngle)));
        for (const p of corners) {
            const delta = p.map((value,i) => value-eye[i]);
            const depth = -dot(delta,back);
            const x = dot(delta,right)/depth, y = dot(delta,up)/depth;
            x0 = Math.min(x0,x); y0 = Math.min(y0,y);
            x1 = Math.max(x1,x); y1 = Math.max(y1,y);
        }
        const fy = zoom*Math.min(1.77*aspect/(x1-x0), 1.62/(y1-y0), 0.87*distance);
        const fx = fy/aspect;
        return { eye, basis: [...right, ...up, ...back],
            lens: [fx, fy, -(x0+x1)*fx/2, 0.015-(y0+y1)*fy/2] };
    }

    const poseSource = `
        layout(location=0) in vec3 position;
        uniform int lidStart;
        uniform vec3 pivot;
        uniform vec2 hingeCS;
        vec3 rotateHinge(vec3 v) {
            return vec3(v.x, hingeCS.x*v.y-hingeCS.y*v.z, hingeCS.y*v.y+hingeCS.x*v.z);
        }
        vec3 worldPosition() {
            return gl_VertexID < lidStart ? position : rotateHinge(position-pivot)+pivot;
        }`;
    const lightingSource = `
        const vec3 keyLight = normalize(vec3(-0.58, 1.15, 0.54));
        vec3 lightSpace(vec3 world) {
            vec3 x = normalize(cross(vec3(0.,1.,0.),keyLight));
            vec3 y = cross(keyLight,x);
            vec3 p = world-vec3(0.,0.80,-0.10);
            return vec3(dot(p,x),dot(p,y),-dot(p,keyLight))/3.7;
        }`;
    const cameraSource = `
        uniform mat3 basis;
        uniform vec3 eye;
        uniform vec4 lens;`;
    const shadowVertex = `#version 300 es
        ${poseSource}
        ${lightingSource}
        void main() { gl_Position = vec4(lightSpace(worldPosition()),1.); }`;
    const shadowFragment = `#version 300 es
        precision highp float;
        void main() {}`;
    const modelVertex = `#version 300 es
        ${poseSource}
        ${cameraSource}
        layout(location=1) in vec3 normal;
        layout(location=2) in vec3 material;
        layout(location=3) in vec2 uv;
        layout(location=4) in float surface;
        out vec3 world;
        out vec3 nWorld;
        out vec3 tint;
        out vec2 texCoord;
        out float foilPosition;
        flat out int surfaceType;
        void main() {
            world = worldPosition();
            nWorld = gl_VertexID < lidStart ? normal : rotateHinge(normal);
            tint = material;
            texCoord = uv;
            foilPosition = position.y;
            surfaceType = int(surface);
            vec3 view = transpose(basis)*(world-eye);
            float depth = -view.z;
            // Perspective near/far planes are 8 and 28 model units.
            gl_Position = vec4(view.xy*lens.xy + depth*lens.zw, depth*1.8-22.4,depth);
        }`;
    const modelFragment = `#version 300 es
        precision highp float;
        precision highp sampler2DShadow;
        ${lightingSource}
        uniform vec3 eye;
        uniform sampler2D legends;
        uniform sampler2D lcd;
        uniform sampler2DShadow depthMap;
        uniform vec2 panelAxis;
        uniform float panelPower;
        uniform vec3 pivot;
        uniform bool glowingScreen;
        in vec3 world;
        in vec3 nWorld;
        in vec3 tint;
        in vec2 texCoord;
        in float foilPosition;
        flat in int surfaceType;
        out vec4 color;

        float visibility(vec3 n) {
            vec3 p = lightSpace(world + n*0.0018)*0.5+0.5;
            vec2 d = 1.35/vec2(textureSize(depthMap,0));
            p.z -= 0.00017;
            return 0.25*(texture(depthMap,p+vec3(d.x,d.y,0.)) +
                         texture(depthMap,p+vec3(-d.x,d.y,0.)) +
                         texture(depthMap,p+vec3(d.x,-d.y,0.)) +
                         texture(depthMap,p+vec3(-d.x,-d.y,0.)));
        }
        void main() {
            vec3 n = normalize(nWorld);
            vec3 v = normalize(eye-world);
            float grazing = pow(1.-clamp(dot(n,v),0.,1.),5.);
            if (surfaceType == 2) {
                vec3 pixels = mix(vec3(0.025,0.030,0.038),texture(lcd,texCoord).rgb,panelPower);
                color = vec4(mix(pixels,vec3(0.62,0.66,0.70),0.006+0.14*grazing),1.);
                return;
            }
            if (surfaceType == 1) {
                vec4 ink = texture(legends,texCoord);
                if (ink.a < 0.015) discard;
                color = vec4((ink.rgb/ink.a)*tint,ink.a);
                return;
            }
            if (surfaceType == 5) {
                color = vec4(tint,1.);
                return;
            }

            float lit = visibility(n);
            float sky = 0.5 + 0.5*n.y;
            float direct = max(dot(n,keyLight),0.)*lit;
            vec3 fillLight = normalize(vec3(0.82,0.55,-0.85));
            float fill = max(dot(n,fillLight),0.);
            float brightness = max(tint.r,max(tint.g,tint.b));
            float metal = surfaceType == 3 || surfaceType == 6 ? 1. : smoothstep(0.16,0.50,brightness)*0.62;
            float rubber = surfaceType == 4 ? 1. : 0.;
            vec3 pigment = tint;
            if (surfaceType == 6) {
                vec3 spectrum = 0.49+0.18*cos(vec3(0.4,2.6,4.7) + foilPosition*4.9+v.x*4.+v.y*1.6);
                pigment = mix(tint,spectrum,0.65);
            }
            vec3 linearPigment = pow(max(pigment,vec3(0.)),vec3(2.2));
            vec3 diffuse = linearPigment * (mix(0.42,0.67,sky)+0.83*direct+
                                                vec3(0.26,0.28,0.32)*fill);
            // A nearby broad source falls off across the satin cover and palm rest.
            vec3 overhead = vec3(1.65,2.6,2.35)-world;
            float irradiance = max(dot(n,normalize(overhead)),0.)/(1.+0.115*dot(overhead,overhead));
            diffuse *= mix(1.,0.24+3.05*irradiance,metal*smoothstep(0.38,0.95,n.y));
            // A low bounce card brings out the underside when the camera goes below the feet.
            vec3 bounce = vec3(2.2,-2.8,-3.0)-world;
            float lowerFill = smoothstep(0.15,2.4,-eye.y)*max(dot(n,normalize(bounce)),0.);
            diffuse += linearPigment*lowerFill*2.3/(1.+0.040*dot(bounce,bounce));
            // Large reflected softboxes reveal the lid, palmrest and narrow bevels.
            vec3 r = reflect(-v,n);
            vec3 stripDir = normalize(vec3(-3.2,2.3,-4.3)-world);
            vec3 rimDir = normalize(vec3(4.1,3.8,-2.6)-world);
            float strip = smoothstep(0.42,0.99,dot(r,stripDir));
            float rim = smoothstep(0.76,0.99,dot(r,rimDir));
            vec3 tallCard = normalize(vec3(2.8,-1.3,-3.4)-world);
            float tallStrip = smoothstep(0.39,0.98,dot(r,tallCard));
            float front = pow(max(dot(n,normalize(keyLight+v)),0.),22.)*lit;
            vec3 reflection = (vec3(0.90,0.94,1.)*strip + vec3(1.,0.94,0.86)*rim*0.62) *
                              (0.0025 + 0.024*metal + 0.036*grazing);
            reflection += vec3(0.91,0.95,1.)*tallStrip*(0.002+0.077*metal);
            reflection += vec3(0.006+0.017*metal)*front;
            reflection *= (1.-0.82*rubber);
            bool palmRest = surfaceType == 7;
            bool keyboardSurface = palmRest || surfaceType == 8;
            if (keyboardSurface) {
                // The open panel screens overhead light from the back rows.
                // Its apparent height falls off towards the front lip.
                vec2 toTop = pivot.yz + 2.32*panelAxis - world.yz;
                float lidElevation = atan(max(0.,toTop.x),max(0.001,-toTop.y));
                float shade = smoothstep(0.55,1.17,lidElevation)*smoothstep(0.08,0.40,panelAxis.x);
                diffuse *= 1.-shade*(palmRest ? 0.74 : 0.36);
                // A satin surface reflects a broad studio card at low angles.
                float facing = 1.-max(dot(n,v),0.);
                float sheen = facing*facing*smoothstep(0.4,0.9,n.y);
                reflection = 0.18*reflection + vec3(0.94,0.96,1.)*sheen*(palmRest ? 0.215 : 0.078);
            }
            // The fine satin finish disappears continuously below the pixel footprint.
            vec3 grainCell = world*vec3(92.,240.,240.);
            vec3 texel = fwidth(grainCell);
            float resolved = 1.-smoothstep(0.45,1.5,max(texel.x,max(texel.y,texel.z)));
            vec3 h = fract(floor(grainCell)*vec3(0.1031,0.1030,0.0973));
            h += dot(h,h.yxz+33.33);
            float grain = fract((h.x+h.y)*h.z)-0.5;
            diffuse *= 1.+0.055*metal*grain*resolved;
            if (glowingScreen && world.y < 0.067 && n.y > 0.35 && panelAxis.x > 0.15) {
                // The satin deck picks up a broad, defocused reflection of the actual LCD.
                vec3 panelUp = vec3(0.,panelAxis);
                vec3 panelNormal = vec3(0.,-panelAxis.y,panelAxis.x);
                vec3 center = pivot + 1.18*panelUp;
                vec3 reflected = reflect(-v,normalize(mix(vec3(0.,1.,0.),n,0.35)));
                float alignment = dot(reflected,panelNormal);
                if (alignment < -0.02) {
                    float hit = dot(center-world,panelNormal)/alignment;
                    vec3 onPanel = world+hit*reflected-center;
                    vec2 coords = vec2(0.5+onPanel.x/3.56,0.5-dot(onPanel,panelUp)/2.00);
                    vec2 edge = smoothstep(vec2(-0.19),vec2(0.12),min(coords,1.-coords));
                    float blur = max(0.,log2(float(textureSize(lcd,0).x)/12.));
                    vec3 light = textureLod(lcd,clamp(coords,0.,1.),blur).rgb;
                    float fresnel = 0.05 + 0.16*pow(1.-max(dot(n,v),0.),2.);
                    if (keyboardSurface) fresnel *= 2.0;
                    reflection += pow(light,vec3(2.2))*edge.x*edge.y*step(0.,hit)*fresnel;
                }
            }
            color = vec4(pow(max(diffuse+reflection,vec3(0.)),vec3(1./2.2)),1.);
        }`;
    const studioVertex = `#version 300 es
        out vec2 clip;
        void main() {
            clip = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2)*2.-1.;
            gl_Position = vec4(clip,0.,1.);
        }`;
    const studioFragment = `#version 300 es
        precision highp float;
        ${cameraSource}
        ${lightingSource}
        uniform vec3 lidTip;
        uniform vec3 pivot;
        in vec2 clip;
        out vec4 color;
        float roundedBox(vec2 p, vec2 halfSize, float radius) {
            vec2 q = abs(p)-halfSize+radius;
            return length(max(q,0.))+min(max(q.x,q.y),0.)-radius;
        }
        // Both the long rear foot and the shorter front feet rest on this plane.
        uniform vec2 floorPlane;
        float heightAboveFloor(vec3 p) { return p.y-floorPlane.y-floorPlane.x*p.z; }
        vec2 castToFloor(vec3 p) {
            return p.xz-keyLight.xz*heightAboveFloor(p)/(keyLight.y-floorPlane.x*keyLight.z);
        }
        void main() {
            float sweep = clamp(0.58+0.29*clip.y-0.11*clip.x-0.045*dot(clip,clip),0.,1.);
            vec3 paper = mix(vec3(0.87,0.879,0.897),vec3(0.981,0.982,0.983),sweep);
            vec3 ray = basis*vec3((clip-lens.zw)/lens.xy,-1.);
            float above = heightAboveFloor(eye);
            float descent = floorPlane.x*ray.z-ray.y;
            if (above > 0. && descent > 0.0001) {
                vec2 floorPoint = eye.xz + ray.xz*above/descent;
                float edge = roundedBox(floorPoint-vec2(0.022,-0.08),vec2(1.82,1.33),0.08);
                float closeShadow = exp(-max(edge,0.)*24.);
                float baseShadow = exp(-max(edge,0.)*5.);
                vec2 a = castToFloor(pivot), b = castToFloor(lidTip);
                float t = clamp((floorPoint.y-a.y)/(abs(b.y-a.y)<0.001 ? 0.001 : b.y-a.y),0.,1.);
                vec2 local = floorPoint-mix(a,b,t);
                float lidEdge = length(vec2(max(abs(local.x)-1.78,0.),local.y));
                float lidShadow = exp(-lidEdge*lidEdge/0.26);
                float strength = smoothstep(0.,1.,above);
                paper *= 1.-(0.14*closeShadow+0.11*baseShadow+0.065*lidShadow)*strength;
            }
            color = vec4(paper,1.);
        }`;

    function program(vertex, fragment) {
        const handle = gl.createProgram();
        for (const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader,source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
            gl.attachShader(handle,shader);
            gl.deleteShader(shader);
        }
        gl.linkProgram(handle);
        if (!gl.getProgramParameter(handle,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(handle));
        const uniforms = {};
        for (let i = 0; i < gl.getProgramParameter(handle,gl.ACTIVE_UNIFORMS); i++) {
            const {name} = gl.getActiveUniform(handle,i);
            uniforms[name] = gl.getUniformLocation(handle,name);
        }
        return {handle, uniforms};
    }

    function initialize() {
        const model = program(modelVertex,modelFragment), studio = program(studioVertex,studioFragment);
        const shadow = program(shadowVertex,shadowFragment);
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER,mesh.vertices,gl.STATIC_DRAW);
        let offset = 0;
        [3,3,3,2,1].forEach((size,index) => {
            gl.enableVertexAttribArray(index);
            gl.vertexAttribPointer(index,size,gl.FLOAT,false,stride*4,offset*4);
            offset += size;
        });
        gl.bindVertexArray(null);

        const aniso = gl.getExtension("EXT_texture_filter_anisotropic");
        function makeTexture(unit,source) {
            gl.activeTexture(gl.TEXTURE0+unit);
            gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
            if (aniso) gl.texParameterf(gl.TEXTURE_2D,aniso.TEXTURE_MAX_ANISOTROPY_EXT,
                Math.min(8,gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
            if (source) gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);
            else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,
                new Uint8Array([14,17,23,255]));
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        // Mipmapping straight-alpha antialiased legends would multiply coverage
        // a second time where strokes get narrower than one screen pixel.
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
        makeTexture(0,mesh.atlas);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
        makeTexture(1,display);
        makeTexture(2,null);
        gl.activeTexture(gl.TEXTURE3);
        const depth = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,depth);
        gl.texStorage2D(gl.TEXTURE_2D,1,gl.DEPTH_COMPONENT24,shadowSize,shadowSize);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_MODE,gl.COMPARE_REF_TO_TEXTURE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_FUNC,gl.LEQUAL);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        const shadowTarget = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER,shadowTarget);
        gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,depth,0);
        gl.drawBuffers([gl.NONE]);
        gl.readBuffer(gl.NONE);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
            throw new Error("Could not create the laptop shadow buffer.");
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);
        for (const pass of [shadow,model]) {
            gl.useProgram(pass.handle);
            gl.uniform3fv(pass.uniforms.pivot,pivot);
            gl.uniform1i(pass.uniforms.lidStart,lidStart);
        }
        gl.uniform1i(model.uniforms.legends,0);
        gl.uniform1i(model.uniforms.depthMap,3);
        gl.useProgram(studio.handle);
        gl.uniform2fv(studio.uniforms.floorPlane,mesh.floorPlane);
        gl.uniform3fv(studio.uniforms.pivot,pivot);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        return {model,studio,shadow,vao,shadowTarget};
    }

    let gpu = initialize();
    let previous = {};
    canvas.addEventListener("webglcontextlost", event => event.preventDefault());
    canvas.addEventListener("webglcontextrestored", () => {
        gpu = initialize();
        previous = {};
    });

    function setCamera(pass, camera) {
        gl.useProgram(pass.handle);
        gl.uniformMatrix3fv(pass.uniforms.basis,false,camera.basis);
        gl.uniform3fv(pass.uniforms.eye,camera.eye);
        gl.uniform4fv(pass.uniforms.lens,camera.lens);
    }

    return function draw(text, elevation=0, yaw=0, wallpaper=null, lidOpen=1, zoom=1) {
        if (gl.isContextLost()) return;
        const cssW = canvas.clientWidth, cssH = canvas.clientHeight;
        if (!cssW || !cssH) return;
        const density = Math.min(window.devicePixelRatio || 1, 2.5, Math.sqrt(7000000/(cssW*cssH)));
        const w = Math.max(1,Math.round(cssW*density)), h = Math.max(1,Math.round(cssH*density));
        const open = Math.max(0,Math.min(1,lidOpen));
        // Image dimensions can be known while the browser is still decoding its pixels.
        const image = wallpaper?.complete && wallpaper.naturalWidth ? wallpaper : null;
        if (previous.w===w && previous.h===h && previous.open===open && previous.zoom===zoom && previous.yaw===yaw &&
            previous.elevation===elevation && previous.text===text && previous.image===image) return;
        const {model,studio,shadow,vao,shadowTarget} = gpu;
        if (canvas.width!==w || canvas.height!==h) { canvas.width=w; canvas.height=h; }
        if (image && image!==previous.image) {
            gl.activeTexture(gl.TEXTURE2);
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        if (text != null && text !== previous.text) {
            terminal.fillStyle = "#0a1017";
            terminal.fillRect(0,0,display.width,display.height);
            terminal.font = "24px Consolas, monospace";
            terminal.fillStyle = "#d2e8f5";
            text.split("\n").forEach((line,i) => terminal.fillText(line,28,32+i*26));
            gl.activeTexture(gl.TEXTURE1);
            gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,display);
            gl.generateMipmap(gl.TEXTURE_2D);
        }

        const angle = (1-open)*lidAngle, c = Math.cos(angle), s = Math.sin(angle);
        if (open!==previous.open) {
            gl.bindFramebuffer(gl.FRAMEBUFFER,shadowTarget);
            gl.viewport(0,0,shadowSize,shadowSize);
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.POLYGON_OFFSET_FILL);
            gl.polygonOffset(1,1);
            gl.clear(gl.DEPTH_BUFFER_BIT);
            gl.useProgram(shadow.handle);
            gl.uniform2f(shadow.uniforms.hingeCS,c,s);
            gl.bindVertexArray(vao);
            gl.drawArrays(gl.TRIANGLES,0,count);
            gl.disable(gl.POLYGON_OFFSET_FILL);
            gl.bindFramebuffer(gl.FRAMEBUFFER,null);
        }
        const camera = cameraFrame(w/h,elevation,yaw,open,zoom);
        gl.viewport(0,0,w,h);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
        gl.bindVertexArray(null);
        setCamera(studio,camera);
        const tip = lid.corners.length ? hinge([0,lid.max[1],lid.max[2]],-open*lidAngle) : pivot;
        gl.uniform3fv(studio.uniforms.lidTip,tip);
        gl.drawArrays(gl.TRIANGLES,0,3);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.bindVertexArray(vao);
        setCamera(model,camera);
        gl.uniform2f(model.uniforms.hingeCS,c,s);
        gl.uniform1i(model.uniforms.lcd,text == null ? 2 : 1);
        gl.uniform1i(model.uniforms.glowingScreen,text == null && image ? 1 : 0);
        gl.uniform1f(model.uniforms.panelPower,Math.max(0,Math.min(1,(open-0.045)/0.065)));
        gl.uniform2f(model.uniforms.panelAxis,Math.sin(open*lidAngle),Math.cos(open*lidAngle));
        gl.drawArrays(gl.TRIANGLES,0,count);
        previous = {w,h,open,yaw,elevation,text,image,zoom};
    };
}
