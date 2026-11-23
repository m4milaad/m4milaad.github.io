// The keyboard is registered to the chassis deck, with the front edge at positive Z.
function buildLegionKeyboard({ triangle, solid, slab, decal, print, labelUV }) {
    const bed = [0.158, 0.167, 0.200];
    const keyFace = [0.182, 0.192, 0.225];
    const keyEdge = [0.20, 0.21, 0.24];
    const lightPipe = [0.60, 0.62, 0.66];

    // A single pressed recess follows both the keyboard and its dropped arrow cluster.
    const wellCorners = [
        [1.761,-0.847], [-1.761,-0.847], [-1.761,0.331], [0.398,0.331],
        [0.398,0.507], [1.113,0.507], [1.113,0.331], [1.761,0.331]
    ];
    function roundedWell(inset, y) {
        const corners = wellCorners.map(([x,z], index) => [
            x + [-1,1,1,1,1,-1,-1,-1][index] * inset,
            z + [1,1,-1,-1,-1,-1,-1,-1][index] * inset,
        ]);
        const points = [];
        for (let i = 0; i < corners.length; i++) {
            const corner = corners[i];
            const from = corners[(i + corners.length - 1) % corners.length];
            const to = corners[(i + 1) % corners.length];
            const radius = 0.014;
            const a = corner.map((n,j) => n + radius * Math.sign(from[j] - n));
            const b = corner.map((n,j) => n + radius * Math.sign(to[j] - n));
            points.push([a[0],y,a[1]], [
                (a[0]+2*corner[0]+b[0])/4, y, (a[1]+2*corner[1]+b[1])/4
            ], [b[0],y,b[1]]);
        }
        return points;
    }
    const lip = roundedWell(0, 0.0035);
    const floor = roundedWell(0.015, 0.0014);
    for (let i = 0; i < floor.length; i++) {
        const j = (i+1) % floor.length;
        triangle(lip[i], lip[j], floor[j], keyEdge, 8);
        triangle(lip[i], floor[j], floor[i], keyEdge, 8);
        triangle([0.755,0.0014,0.14], floor[i], floor[j], bed, 8);
    }

    // TrueStrike keys have a straight rear edge and a subtly bowed front skirt.
    function capRing(x,z,width,depth,y,inset) {
        const hw = width/2-inset, hd = depth/2-inset;
        const r = Math.min(0.013, hd/3);
        const bow = Math.min(0.0055, hd/10);
        return [
            [hw,-hd+r], [hw-0.3*r,-hd+0.3*r], [hw-r,-hd], [-hw+r,-hd],
            [-hw+0.3*r,-hd+0.3*r], [-hw,-hd+r], [-hw,hd-bow-r],
            [-hw+0.3*r,hd-bow-0.3*r], [-hw+r,hd-bow], [-hw*0.31,hd],
            [hw*0.31,hd], [hw-r,hd-bow], [hw-0.3*r,hd-bow-0.3*r], [hw,hd-bow-r]
        ].map(([dx,dz]) => [x+dx,y,z+dz]);
    }
    const shifted = {
        "`":"~", "1":"!", "2":"@", "3":"#", "4":"$", "5":"%", "6":"^", "7":"&",
        "8":"*", "9":"(", "0":")", "-":"_", "=":"+", "[":"{", "]":"}", "\\":"|",
        ";":":", "'":'"', ",":"<", ".":">", "/":"?"
    };
    const padSecondary = {"7":"Home", "8":"↑", "9":"PgUp", "4":"←", "6":"→", "1":"End", "2":"↓", "3":"PgDn", "0":"Ins", ".":"Del"};
    // Each symbol is drawn at the physical size of the laser-etched key legend.
    function functionSymbol(g, n, x, z, size) {
        g.save();
        g.translate(x,z);
        g.scale(size,size);
        g.lineWidth = 0.095;
        g.lineCap = "round";
        g.lineJoin = "round";
        g.beginPath();
        if (n <= 3) {
            g.moveTo(0.05,0.4); g.lineTo(0.30,0.4); g.lineTo(0.58,0.17);
            g.lineTo(0.58,0.83); g.lineTo(0.30,0.60); g.lineTo(0.05,0.60); g.closePath();
            if (n === 1) {
                g.moveTo(0.73,0.37); g.lineTo(0.95,0.63);
                g.moveTo(0.95,0.37); g.lineTo(0.73,0.63);
            } else {
                g.moveTo(0.71,0.32); g.quadraticCurveTo(0.91,0.5,0.71,0.68);
                if (n === 3) {g.moveTo(0.82,0.15); g.quadraticCurveTo(1.13,0.5,0.82,0.85);}
            }
        } else if (n === 4) {
            g.roundRect(0.37,0.05,0.27,0.59,0.13);
            g.moveTo(0.20,0.51); g.quadraticCurveTo(0.52,1.04,0.82,0.51);
            g.moveTo(0.52,0.76); g.lineTo(0.52,0.92); g.moveTo(0.10,0.90); g.lineTo(0.90,0.08);
        } else if (n === 5 || n === 6) {
            g.arc(0.5,0.5,n===5?0.15:0.21,0,Math.PI*2);
            for (let i=0;i<8;i++) {
                const a = i*Math.PI/4;
                g.moveTo(0.5+0.32*Math.cos(a),0.5+0.32*Math.sin(a));
                g.lineTo(0.5+0.44*Math.cos(a),0.5+0.44*Math.sin(a));
            }
        } else {
            const marks = {7:"▣",8:"✈",9:"⚙",10:"▤",11:"▦",12:"☆"};
            g.font = "0.95px 'Segoe UI Symbol', Arial, sans-serif";
            g.textAlign = "center"; g.textBaseline = "middle";
            g.fillText(marks[n],0.5,0.52);
        }
        g.stroke();
        g.restore();
    }
    function legend(key, w, d) {
        return labelUV("key/"+key+"/"+w.toFixed(3)+"/"+d.toFixed(3), (g,px,py,size) => {
            g.translate(px,py);
            g.scale(size/w,size/d);
            g.fillStyle = "#edf0f5";
            g.strokeStyle = "#e1e6ed";
            const left = 0.012;
            function text(value,x,z,height,align="left") {
                // Give the font rasterizer native pixel sizes for the etching.
                const pixelsPerUnit = 1000;
                g.save();
                g.scale(1/pixelsPerUnit,1/pixelsPerUnit);
                g.textAlign = align;
                g.textBaseline = "middle";
                g.font = "600 "+(height*1.13*pixelsPerUnit)+"px Arial, sans-serif";
                g.fillText(value,x*pixelsPerUnit,z*pixelsPerUnit,(w-2*left)*pixelsPerUnit);
                g.restore();
            }
            if (key === "Win") {
                const side = 0.022;
                for (const dx of [-1,0]) for (const dz of [-1,0]) {
                    g.fillRect(w/2+dx*(side+0.0035), d/2+dz*(side+0.0035), side, side);
                }
            } else if (key === "Space") {
                // Backlight pictogram near the left end of the space bar.
                g.strokeStyle = "#c3c9d2"; g.lineWidth = 0.0035;
                g.strokeRect(left,0.039,0.039,0.018);
                for (let i=0;i<3;i++) g.fillRect(left+0.005+i*0.012,0.027,0.0035,0.0075);
            } else if (key.startsWith("Num:")) {
                const value = key.slice(4);
                if (value === "Enter" || value === "+") {
                    text(value,left,d/2,value === "+"?0.055:0.039);
                } else {
                    text(value,left,0.038,value.length>1?0.038:0.056);
                    if (padSecondary[value]) text(padSecondary[value],w-left,d-0.023,0.030,"right");
                }
            } else if (/^F\d+$/.test(key)) {
                text(key,left,0.022,0.037);
                functionSymbol(g,Number(key.slice(1)),w-0.054,d-0.045,0.040);
            } else if (key === "Esc") {
                text("Esc",left,0.024,0.042);
                text("FnLock",left,d-0.022,0.028);
            } else if (key in shifted) {
                text(shifted[key],left,0.032,0.048);
                text(key,left,d-0.035,0.049);
            } else if (["←","↑","↓","→"].includes(key)) {
                text(key,w/2,d/2,0.071,"center");
            } else if (key.length === 1) {
                text(key,left,0.038,0.060);
            } else {
                const right = key === "Backspace" || key === "Enter" || key === "RShift";
                text(key === "RShift" ? "Shift" : key, right?w-left:left,d/2,0.040,right?"right":"left");
            }
        });
    }
    function keycap(key,x,z,w,d) {
        const skirt = capRing(x,z,w,d,0.003,0.001);
        const diffuser = capRing(x,z,w,d,0.015,0);
        const rim = capRing(x,z,w,d,0.021,0.0038);
        const crown = capRing(x,z,w,d,0.029,0.009);
        const edges = [[skirt,diffuser,bed,8],[diffuser,rim,lightPipe,5],[rim,crown,keyEdge,8]];
        for (let i=0; i<crown.length; i++) {
            const j=(i+1)%crown.length;
            for (const [lower,upper,tint,material] of edges) {
                triangle(lower[i],lower[j],upper[j],tint,material);
                triangle(lower[i],upper[j],upper[i],tint,material);
            }
            triangle([x,0.029,z],crown[i],crown[j],keyFace,8);
        }
        const width = w-0.027, depth = d-0.026;
        decal(x,0.0293,z,width,depth,1,legend(key,width,depth));
    }

    const centers = [-0.755,-0.593,-0.399,-0.202,-0.008,0.184];
    const keyDepth = 0.171;
    const keyGap = 0.014;
    const left = -1.742, right = 1.080;
    function row(keys, weights, z, d, start=left, end=right) {
        const unit = (end-start+keyGap)/weights.reduce((sum,value) => sum+value,0);
        let x=start;
        keys.forEach((key,i) => {
            const pitch = weights[i]*unit;
            keycap(key,x+(pitch-keyGap)/2,z,pitch-keyGap,d);
            x += pitch;
        });
    }
    const functions = ["Esc",...Array.from({length:12},(_,i) => "F"+(i+1)),"PrtSc","Insert","Delete"];
    row(functions,functions.map(name => name==="Esc"||name==="Delete"?1.14:1),centers[0],0.125);
    row(["`",..."1234567890-=","Backspace"],[0.88,...Array(12).fill(1),1.56],centers[1],keyDepth);
    row(["Tab",..."QWERTYUIOP[]","\\"],[1.31,...Array(12).fill(1),1.05],centers[2],keyDepth);
    row(["CapsLk",..."ASDFGHJKL;'","Enter"],[1.59,...Array(11).fill(1),1.78],centers[3],keyDepth);
    row(["Shift",..."ZXCVBNM,./","RShift"],[2.13,...Array(10).fill(1),2.20],centers[4],keyDepth);
    row(["Ctrl","Fn","Win","Alt","Space","Alt","Ctrl"],[1.07,1,1,1,5.03,1,1],centers[5],keyDepth,left,0.432);

    const padStart = 1.095, padEnd = 1.735;
    const padPitch=(padEnd-padStart+keyGap)/4;
    row(["Home","End","PgUp","PgDn"],[1,1,1,1],centers[0],0.125,padStart,padEnd);
    function pad(key,col,r,cols=1,rows=1) {
        const width=cols*padPitch-keyGap;
        const height=keyDepth+centers[r+rows-1]-centers[r];
        keycap("Num:"+key,padStart+col*padPitch+width/2,centers[r]+(height-keyDepth)/2,width,height);
    }
    [["NumLk","/","*","−"],["7","8","9"],["4","5","6"],["1","2","3"]].forEach((keys,i) => {
        keys.forEach((key,col) => pad(key,col,i+1));
    });
    pad("+",3,2,1,2);
    pad("Enter",3,4,1,2);
    pad("0",0,5,2);
    pad(".",2,5);
    keycap("↑",0.756,centers[5],0.202,0.160);
    ["←","↓","→"].forEach((key,i) => keycap(key,0.538+i*0.218,0.350,0.202,0.160));

    // The glass sits inside a hairline graphite border towards the typing position.
    solid(-0.446,0.817,1.253,0.787,0.015,[[0.0005,0],[0.0029,0.002]], [0.155,0.165,0.190]);
    solid(-0.446,0.817,1.240,0.775,0.011,[[0.00295,0],[0.0042,0.002]], [0.204,0.219,0.257],7);
    solid(0,-0.931,0.081,0.081,0.039,[[0.001,0],[0.004,0.001]], [0.214,0.222,0.248]);
    slab(0,0.0042,-0.931,0.069,0.002,0.069,[0.284,0.295,0.332],0.034);
    slab(0,0.0064,-0.931,0.013,0.001,0.013,[0.91,0.94,1],0.006);
    solid(1.766,0.936,0.107,0.335,0.005,[[0.0008,0.002],[0.004,0],[0.005,0.001]], [0.62,0.641,0.675],3);
    print("Lenovo",1.766,0.0054,0.936,0.082,0.286,true,"#21232a");
}
