// X runs across the palm rest, +Z is the front lip, and the deck is at Y = 0.
function buildLegionChassis({ triangle, solid, slab, labelUV, legionMark, frontZ, pivotY, pivotZ }) {
    // Lenovo's Legion 5 15ARP8 PSREF lists a 358.8 by 262.35 mm footprint.
    // Keep the keyboard and hinge stations fixed, with the extra depth behind the lid.
    const rearZ = frontZ - 3.70*262.35/358.8;
    const deck = [0.238, 0.251, 0.293];
    const edge = [0.245, 0.257, 0.281];
    const graphite = [0.174, 0.180, 0.197];
    const underside = [0.135, 0.141, 0.152];
    const rubber = [0.060, 0.062, 0.069];
    const cut = [0.057, 0.061, 0.069];
    const cavity = [0.018, 0.021, 0.026];
    const nickel = [0.325, 0.332, 0.347];
    const bottomY = z => -0.163 + 0.025 * z;
    const bandTop = -0.026;
    // In plan view the two exhaust housings project beyond the sockets and
    // the end bumpers. These same stations shape the top, rear and underside.
    const bayEnd = .790, ventStart = .858, ventEnd = 1.646, bumperStart = 1.701;
    const rearStations = [-bumperStart,-ventEnd,-ventStart,-bayEnd,bayEnd,ventStart,ventEnd,bumperStart];
    const bayDepth = .086, bumperDepth = .034;
    const bayLift = .016, bumperLift = .010;
    function rearProfile(x, center, bumper) {
        const u = Math.abs(x);
        const bay = Math.max(0, Math.min(1, (ventStart-u)/(ventStart-bayEnd)));
        const end = Math.max(0, Math.min(1, (u-ventEnd)/(bumperStart-ventEnd)));
        return center*bay + bumper*end;
    }
    const rearFaceZ = x => rearZ + rearProfile(x, bayDepth, bumperDepth);
    const rearLipLift = x => rearProfile(x, bayLift, bumperLift);

    function quad(a, b, c, d, tint, mode = 0) {
        triangle(a, b, c, tint, mode);
        triangle(a, c, d, tint, mode);
    }

    // Matching rings let the shoulder wrap continuously from the front lip
    // into the narrower, sloping service cover on the underside.
    function perimeter(inset, height, lower = false) {
        const points = [];
        const r = 0.068 - inset * 0.5;
        for (let corner = 0; corner < 4; corner++) {
            const sx = corner === 0 || corner === 3 ? 1 : -1;
            const sz = corner < 2 ? -1 : 1;
            for (let i = 0; i <= 6; i++) {
                const a = (corner + i / 6) * Math.PI / 2;
                const x = sx * (1.85 - inset - r) + r * Math.cos(a);
                const z = (sz < 0 ? rearZ+bumperDepth : frontZ) - sz*(inset+r) - r*Math.sin(a);
                const lift = lower && sz < 0 ? bumperLift*Math.sin(a) : 0;
                points.push([x, height(z)+lift, z]);
            }
            if (corner === 0) {
                for (let i = rearStations.length-1; i >= 0; i--) {
                    const x = rearStations[i], z = rearFaceZ(x)+inset;
                    points.push([x, height(z)+(lower ? rearLipLift(x) : 0), z]);
                }
            }
        }
        return points;
    }

    function joinRings(low, high, tint, mode = 0) {
        low.forEach((p, i) => {
            const j = (i + 1) % low.length;
            quad(p, low[j], high[j], high[i], tint, mode);
        });
    }

    const deckTop = perimeter(0.016, () => 0);
    const bevel = perimeter(0.003, () => -0.008);
    const lip = perimeter(0, () => -0.021);
    const shoulder = perimeter(0, () => bandTop);
    const lowerWall = perimeter(0, z => bottomY(z) + 0.021, true);
    const lowerEdge = perimeter(0.025, z => bottomY(z) + 0.011, true);
    const belly = perimeter(0.057, bottomY, true);
    // Split the top skin at the hinges. The rear shelf ends at the real
    // notched outline so it cannot cover the recess from an overhead view.
    const shelfFront = -1.085;
    const deckOutline = deckTop.map(([x,y,z]) => [x,y,Math.max(z,shelfFront)]);
    deckTop.forEach((p, i) => {
        const j = (i+1)%deckTop.length;
        triangle([0,0,0],deckOutline[i],deckOutline[j],deck,7);
        if (p[2]<shelfFront && deckTop[j][2]<shelfFront) {
            quad(p,deckTop[j],deckOutline[j],deckOutline[i],graphite);
        }
    });
    joinRings(bevel, deckTop, deck, 7);
    joinRings(lip, bevel, edge, 3);
    joinRings(shoulder, lip, graphite);
    joinRings(lowerEdge, lowerWall, graphite);
    joinRings(belly, lowerEdge, underside);
    lowerWall.forEach((p, i) => {
        const j = (i + 1) % lowerWall.length;
        // Ports occupy the side flats and the full stepped rear run.
        const q = lowerWall[j];
        const rearPanel = p[2] <= rearZ+bayDepth && q[2] <= rearZ+bayDepth &&
                          Math.abs(p[0]) <= 1.78201 && Math.abs(q[0]) <= 1.78201;
        const sidePanel = Math.abs(Math.abs(p[0])-1.85)<1e-8 && Math.abs(q[0]-p[0])<1e-8;
        if (!rearPanel && !sidePanel) quad(p,q,shoulder[j],shoulder[i],graphite);
    });

    // Each connector has its own cutout, return walls and an interior contact.
    // Cross sections describe the bottom and top edges, read from left to right.
    const chamfer = [[-.5, -.34, .34], [-.46, -.5, .5], [.46, -.5, .5], [.5, -.34, .34]];
    const hdmi = [[-.5, -.13, .40], [-.47, -.19, .50], [-.36, -.5, .50],
        [.36, -.5, .50], [.47, -.19, .50], [.5, -.13, .40]];
    const ethernet = [[-.5, -.45, .23], [-.48, -.5, .28], [-.27, -.5, .28],
        [-.27, -.5, .50], [.27, -.5, .50], [.27, -.5, .28], [.48, -.5, .28], [.5, -.45, .23]];
    function capsule(width, height) {
        const r = Math.min(0.5, height / (2 * width));
        const values = [];
        for (let end = 0; end < 2; end++) {
            for (let i = 0; i <= 5; i++) {
                const theta = (1 - (end + i / 5) / 2) * Math.PI;
                const x = (end ? .5 - r : r - .5) + r * Math.cos(theta);
                const y = .5 * Math.sin(theta);
                values.push([x, -y, y]);
            }
        }
        return values;
    }

    function wallPanel(map, start, end, lower, holes, surface, top = bandTop) {
        const face = 0;
        function strip(u0, u1, b0, b1, t0, t1, depth, tint, mode = 0) {
            quad(map(u0, b0, depth), map(u1, b1, depth), map(u1, t1, depth), map(u0, t0, depth), tint, mode);
        }
        let cursor = start;
        for (const [kind, u, y, w, h] of holes.sort((a, b) => a[1] - b[1])) {
            const left = u - w / 2;
            strip(cursor, left, lower(cursor), lower(left), top, top, face, surface);
            const profile = kind === 'ethernet' ? ethernet : kind === 'hdmi' ? hdmi
                : ['usb-c', 'jack', 'switch'].includes(kind) ? capsule(w, h) : chamfer;
            const throat = face + (kind === 'exhaust' ? .075 : .035);
            const frontBottom = [], frontTop = [], innerBottom = [], innerTop = [];
            for (const [x, b, t] of profile) {
                const pos = u + x * w;
                frontBottom.push(map(pos, y + b * h, face));
                frontTop.push(map(pos, y + t * h, face));
                innerBottom.push(map(u + x * w * .96, y + b * h * .88, throat));
                innerTop.push(map(u + x * w * .96, y + t * h * .88, throat));
            }
            const last = profile.length - 1;
            for (let i = 0; i < last; i++) {
                const j = i + 1;
                const a = u + profile[i][0] * w, b = u + profile[j][0] * w;
                quad(map(a, lower(a), face), map(b, lower(b), face), frontBottom[j], frontBottom[i], surface);
                quad(frontTop[i], frontTop[j], map(b, top, face), map(a, top, face), surface);
                quad(frontBottom[i], frontBottom[j], innerBottom[j], innerBottom[i], cut);
                quad(frontTop[j], frontTop[i], innerTop[i], innerTop[j], cut);
                quad(innerBottom[i], innerBottom[j], innerTop[j], innerTop[i], cavity, 4);
            }
            quad(frontTop[0], frontBottom[0], innerBottom[0], innerTop[0], cut);
            quad(frontBottom[last], frontTop[last], innerTop[last], innerBottom[last], cut);
            if (kind === 'exhaust') {
                const count = 8;
                for (let i = 1; i < count; i++) {
                    const x = left + w * i / count;
                    const lo = y - .49 * h, hi = y + .49 * h;
                    const slant = h * .06, gauge = .016;
                    const foot = map(x - slant, lo, face + .003);
                    const crown = map(x + slant, hi, face + .003);
                    quad(foot, map(x - slant + gauge, lo, face + .003), map(x + slant + gauge, hi, face + .003), crown, graphite);
                    quad(crown, map(x + slant - .018, hi, throat), map(x - slant - .018, lo, throat), foot, cut);
                    quad(map(x - slant + gauge, lo, face + .003), map(x - slant - .018, lo, throat),
                        map(x + slant - .018, hi, throat), map(x + slant + gauge, hi, face + .003), cut);
                }
            }
            if (kind === 'exhaust' || kind === 'side-fin') {
                const count = Math.round(w / .010);
                const depth = throat - .007;
                for (let i = 1; i < count; i++) {
                    const x = left + .025 * w + .95 * w * i / count;
                    strip(x, x + .002, y - .42 * h, y - .42 * h, y + .42 * h, y + .42 * h, depth, cut);
                }
            } else if (kind === 'ethernet') {
                for (let i = 0; i < 8; i++) {
                    const pin = u + (i - 3.5) * .011;
                    strip(pin, pin + .003, y - .014, y - .014, y + .003, y + .003, throat - .002, nickel, 3);
                }
            } else if (kind !== 'jack' && kind !== 'speaker') {
                const tongueY = y + (kind === 'usb-a' ? h * .18 : 0);
                const length = kind === 'switch' ? w * .34 : w * .72;
                const center = kind === 'switch' ? u - w * .16 : u;
                strip(center - length / 2, center + length / 2, tongueY - .005, tongueY - .005,
                    tongueY + .005, tongueY + .005, face + .011, kind === 'switch' ? [.47, .076, .093] : nickel, 3);
            }
            cursor = u + w / 2;
        }
        strip(cursor, end, lower(cursor), lower(end), top, top, face, surface);
    }

    // The right Type-A receptacle straddles the two case halves. Its lower
    // surround is molded into the service cover, below the deck's side rail.
    function rightUsb(map, center, halfWidth, seam, lower) {
        const left = center - halfWidth, right = center + halfWidth;
        const surroundBottom = seam - .043;
        quad(map(left, lower(left), 0), map(right, lower(right), 0),
            map(right, surroundBottom, 0), map(left, surroundBottom, 0), underside);

        // Split each side at the case seam so the rim can meet both materials.
        function outline(half, low, high, radius, depth) {
            const l = center - half, r = center + half;
            return [[l+radius,low], [r-radius,low], [r,low+radius], [r,seam],
                [r,high-radius], [r-radius,high], [l+radius,high], [l,high-radius],
                [l,seam], [l,low+radius]].map(([u,y]) => map(u,y,depth));
        }
        const surround = outline(halfWidth, surroundBottom, bandTop, 0, 0);
        const mouth = outline(.070, -.106, -.041, .004, 0);
        const lip = outline(.067, -.103, -.044, .003, .004);
        const throat = outline(.066, -.102, -.045, .003, .085);
        const shell = [.185, .190, .198];
        for (let i = 0; i < mouth.length; i++) {
            const j = (i+1) % mouth.length;
            const upper = i >= 3 && i < 8;
            quad(surround[i], surround[j], mouth[j], mouth[i], upper ? edge : graphite);
            quad(mouth[i], mouth[j], lip[j], lip[i], shell, 3);
            quad(lip[i], lip[j], throat[j], throat[i], cut);
            triangle(map(center, seam, .085), throat[i], throat[j], cavity, 4);
        }

        // A black insulator is anchored to the back, with the mating contacts
        // on its underside. The lower half of the opening stays clear.
        const tongueLow = -.071, tongueHigh = -.058;
        const tongue = [
            [-.054, .013], [.054, .013], [.056, .016], [.056, .085],
            [-.056, .085], [-.056, .016]
        ];
        const top = tongue.map(([u,d]) => map(center+u, tongueHigh, d));
        const bottom = tongue.map(([u,d]) => map(center+u, tongueLow, d));
        for (let i = 0; i < tongue.length; i++) {
            const j = (i+1) % tongue.length;
            quad(bottom[i], bottom[j], top[j], top[i], i === 0 ? [.246,.244,.239] : graphite);
            triangle(map(center,tongueHigh,.045), top[i], top[j], graphite);
            triangle(map(center,tongueLow,.045), bottom[j], bottom[i], cut);
        }
        for (const offset of [-.0375, -.0125, .0125, .0375]) {
            const u = center + offset;
            const contactY = tongueLow - .0005;
            quad(map(u-.003,contactY,.021), map(u-.003,contactY,.058),
                map(u+.003,contactY,.058), map(u+.003,contactY,.021), nickel, 3);
        }

        const uv = labelUV('right-usb-superspeed', (ink,x,y,size) => {
            ink.translate(x,y);
            ink.scale(size/100,size/31);
            ink.fillStyle = ink.strokeStyle = '#24252a';
            ink.font = 'bold italic 29px Arial, sans-serif';
            ink.fillText('SS', 1, 26);
            ink.lineWidth = 3;
            ink.beginPath();
            ink.moveTo(40,16); ink.lineTo(91,16);
            ink.moveTo(46,16); ink.lineTo(61,5); ink.lineTo(74,5);
            ink.moveTo(52,16); ink.lineTo(67,26); ink.lineTo(79,26);
            ink.stroke();
            ink.fillRect(76,23,6,6);
            ink.beginPath(); ink.arc(75,5,3,0,Math.PI*2); ink.fill();
            ink.beginPath(); ink.moveTo(89,11); ink.lineTo(99,16); ink.lineTo(89,21); ink.fill();
        });
        const a = map(left-.048,-.045,-.0003), b = map(left+.008,-.045,-.0003);
        const c = map(left+.008,-.025,-.0003), d = map(left-.048,-.025,-.0003);
        const white = [1,1,1];
        triangle(a,b,c,white,1,[uv[1],uv[2],uv[3]]);
        triangle(a,c,d,white,1,[uv[1],uv[3],uv[0]]);
    }

    const rear = (u, y, d) => [-u, y, rearFaceZ(u) + d];
    const rearBottom = u => bottomY(rearFaceZ(u)) + .021 + rearLipLift(u);
    wallPanel(rear, -bayEnd, bayEnd, rearBottom, [
        ['ethernet', -.628, -.095, .149, .091], ['usb-c', -.388, -.096, .091, .031],
        ['hdmi', -.148, -.095, .158, .053], ['usb-a', .123, -.093, .143, .056],
        ['usb-a', .380, -.093, .143, .056], ['power', .645, -.094, .120, .051]
    ], [0.192, 0.201, 0.218]);
    for (const side of [-1,1]) {
        const section = (a,b,holes,surface) =>
            wallPanel(rear,Math.min(side*a,side*b),Math.max(side*a,side*b),rearBottom,holes,surface);
        section(bayEnd,ventStart,[],graphite);
        section(ventStart,ventEnd,[['exhaust',side*1.252,-.096,.736,.112]],edge);
        section(ventEnd,bumperStart,[],graphite);
        section(bumperStart,1.782,[],graphite);
    }
    for (const side of [-1, 1]) {
        const sideMap = (u, y, d) => [side * (1.85 - d), y, -side * u];
        const sideRearZ = rearZ + bumperDepth + .068;
        const start = side < 0 ? sideRearZ : -frontZ + .068;
        const end = side < 0 ? frontZ - .068 : -sideRearZ;
        const holes = side === -1
            ? [['usb-c', .205, -.052, .095, .034]]
            : [['jack', -.505, -.052, .044, .044], ['switch', -.326, -.051, .059, .028]];
        const seam = -.083;
        const lower = u => bottomY(-side * u) + .021;
        const vents = [], speakers = [];
        const lastVent = side === 1 ? .873 : .770;
        for (let i = 0; i < 4; i++) vents.push(['side-fin', side * (lastVent - i * .176), -.105, .152, .040]);
        for (let i = 0; i < 8; i++) speakers.push(['speaker', -side * (.795 + i * .030), -.101, .018, .032]);
        if (side === 1) {
            const center = .120, halfWidth = .085;
            wallPanel(sideMap, start, center-halfWidth, () => seam, holes, edge);
            wallPanel(sideMap, start, center-halfWidth, lower, speakers, underside, seam);
            rightUsb(sideMap, center, halfWidth, seam, lower);
            wallPanel(sideMap, center+halfWidth, end, () => seam, [], edge);
            wallPanel(sideMap, center+halfWidth, end, lower, vents, underside, seam);
            quad(sideMap(-.172, -.049, -.0003), sideMap(-.162, -.049, -.0003),
                sideMap(-.162, -.039, -.0003), sideMap(-.172, -.039, -.0003), [.75, .78, .76], 5);
        } else {
            wallPanel(sideMap, start, end, () => seam, holes, edge);
            wallPanel(sideMap, start, end, lower, [...vents, ...speakers], underside, seam);
        }
    }

    // The air intakes cut through the service cover. Shallow twin impellers
    // are visible between the longitudinal slots when viewed from below.
    const under = (x, z, depth = 0) => [x, bottomY(z) + depth, z];
    const bound = 1.665, back = -.863, front = -.166;
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const rim = belly.map(([x, , z]) => under(clamp(x, -bound, bound), clamp(z, back, front)));
    belly.forEach((p, i) => {
        const j = (i + 1) % belly.length;
        quad(p, rim[i], rim[j], belly[j], underside);
    });
    function underRect(x0, x1, z0, z1, depth, tint, mode = 0) {
        quad(under(x0, z0, depth), under(x1, z0, depth), under(x1, z1, depth), under(x0, z1, depth), tint, mode);
    }
    underRect(-bound, bound, back, front, .027, cavity, 4);
    for (const hub of [-1.055, 1.055]) {
        const point = (r, a) => under(hub + r * Math.cos(a), -.515 + r * Math.sin(a), .021);
        for (let i = 0; i < 27; i++) {
            const a = i * 2 * Math.PI / 27;
            quad(point(.092, a), point(.34, a + .14), point(.34, a + .21), point(.092, a + .08), [0.081, 0.086, 0.094]);
        }
    }
    const banks = 11, bankWidth = 2 * bound / banks, pitch = (front - back) / 6;
    const shallowRib = [.116, .120, .131];
    for (let bank = 0; bank < banks; bank++) {
        const x0 = -bound + bank * bankWidth, x1 = x0 + bankWidth;
        const stagger = (bank % 2) * .5 * pitch;
        const rows = bank % 2 ? 5 : 6;
        if (stagger) {
            underRect(x0, x1, back, back + stagger, 0, underside);
            underRect(x0, x1, front - stagger, front, 0, underside);
        }
        for (let row = 0; row < rows; row++) {
            const z0 = back + stagger + row * pitch, z1 = z0 + pitch;
            const open = bank < 3 || bank > 7 || ((bank === 4 || bank === 6) && row < 2) || (bank === 5 && row === 0);
            // The cover has eleven staggered columns of hexagonal openings.
            // Above the heat spreader, the same tooling leaves shallow blind ribs.
            const inset = x => .009 + Math.max(0, .045 - Math.min(x - x0, x1 - x));
            const count = 24, depth = open ? .014 : .003;
            for (let slot = 0; slot < count; slot++) {
                const a = x0 + bankWidth * slot / count;
                const b = x0 + bankWidth * (slot + 1) / count;
                const ia = inset(a), ib = inset(b);
                if (slot % 2 === 0 || slot === count - 1) {
                    underRect(a, b, z0, z1, 0, underside);
                    continue;
                }
                quad(under(a, z0), under(b, z0), under(b, z0 + ib), under(a, z0 + ia), underside);
                quad(under(a, z1 - ia), under(b, z1 - ib), under(b, z1), under(a, z1), underside);
                const A = under(a, z0 + ia), B = under(b, z0 + ib);
                const C = under(b, z1 - ib), D = under(a, z1 - ia);
                const I = under(a, z0 + ia, depth), J = under(b, z0 + ib, depth);
                const K = under(b, z1 - ib, depth), L = under(a, z1 - ia, depth);
                quad(A, B, J, I, cut);
                quad(B, C, K, J, cut);
                quad(C, D, L, K, cut);
                quad(D, A, I, L, cut);
                if (!open) quad(I, J, K, L, shallowRib);
            }
        }
    }

    function foot(x, z, width, depth, height) {
        const y = bottomY(z);
        solid(x, z, width, depth, .022, [[y - height, .009], [y - height + .006, .002], [y + .002, 0]], rubber, 4);
    }
    const railZ = rearZ + .278;
    foot(0, railZ, 3.192, .101, .026);
    legionMark([.118, bottomY(railZ) - .0265, railZ - .022], [-.236, 0, 0], [0, 0, .044], [.265, .274, .290], 3);
    for (const side of [-1, 1]) {
        foot(side * 1.226, .976, .742, .088, .024);
    }
    const screwPoints = [[-1.68, rearZ+.197], [-.51, rearZ+.197], [.51, rearZ+.197], [1.68, rearZ+.197],
        [-1.68, .10], [1.68, .10], [-1.68, 1.209], [1.68, 1.209], [-.51, 1.209], [.51, 1.209]];
    for (const [x, z] of screwPoints) {
        for (let i = 0; i < 12; i++) {
            const a = i * Math.PI / 6, b = (i + 1) * Math.PI / 6;
            const p = (r, t, d) => under(x + r * Math.cos(t), z + r * Math.sin(t), d);
            quad(p(.024, a, -.001), p(.024, b, -.001), p(.016, b, -.002), p(.016, a, -.002), cut);
            triangle(under(x, z, -.002), p(.016, a, -.002), p(.016, b, -.002), graphite, 3);
        }
        underRect(x - .009, x + .009, z - .002, z + .002, -.0026, cavity);
        underRect(x - .002, x + .002, z - .009, z + .009, -.0027, cavity);
    }

    // The lid sits on two short horizontal knuckles set into cast saddles.
    for (const side of [-1, 1]) {
        const center = side * 1.46;
        slab(center, -.001, pivotZ, .318, .013, .088, graphite, .016);
        const rings = [[-.157, .032], [-.149, .039], [-.132, .040], [.132, .040], [.149, .039], [.157, .032]];
        const at = ([x, r], a) => [center + x, pivotY + r * Math.cos(a), pivotZ + r * Math.sin(a)];
        for (let i = 0; i < 24; i++) {
            const a = i * Math.PI / 12, b = (i + 1) * Math.PI / 12;
            for (let j = 1; j < rings.length; j++) {
                quad(at(rings[j - 1], a), at(rings[j - 1], b), at(rings[j], b), at(rings[j], a), j === 3 ? graphite : cut, 3);
            }
            triangle([center - .157, pivotY, pivotZ], at(rings[0], b), at(rings[0], a), cut);
            triangle([center + .157, pivotY, pivotZ], at(rings[5], a), at(rings[5], b), cut);
        }
    }
}
