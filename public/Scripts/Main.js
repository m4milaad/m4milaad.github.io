// The terminal programs share the scene clock and mode with this viewer.
let State = "Modern";
let Time = 0;

(() => {
    const canvas = document.getElementById("Canvas3D");
    const fallback = document.getElementById("TerminalFallback");
    const portfolio = document.getElementById("MainDiv");
    const open = document.getElementById("OpenTerminal");
    const close = document.getElementById("MainButton");
    const screenButton = document.getElementById("ScreenToggle");
    const lidButton = document.getElementById("LidToggle");
    const hint = document.getElementById("OrbitHint");
    const boot = document.getElementById("ComputerBoot");
    const ambient = document.getElementById("ComputerAmbient");
    const keySound = document.getElementById("KeyboardPressed");
    const wallpaper = new Image();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointers = new Map();
    const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

    let draw;
    let displayImage = null;
    let terminal = false, lidOpen = 1, lidTarget = 1;
    let yaw = 0, elevation = 0, zoom = 1;
    let frame = 0, lastTime = 0;
    let terminalStarted = false;
    ambient.loop = true;
    boot.volume = 0.5;
    ambient.volume = 0.25;

    function setAudio(active) {
        if (active) {
            if (!terminalStarted) boot.play().catch(() => {});
            ambient.play().catch(() => {});
            terminalStarted = true;
        } else {
            boot.pause();
            ambient.pause();
        }
    }

    function schedule() {
        if (State === "Retro" && !frame) frame = requestAnimationFrame(render);
    }
    function render(now) {
        frame = 0;
        const elapsed = Math.max(0, (now-lastTime)/1000);
        lastTime = now;
        if (terminal) Time += elapsed;
        const distance = lidTarget-lidOpen;
        const step = elapsed/0.55;
        lidOpen = reducedMotion.matches || Math.abs(distance) <= step ? lidTarget : lidOpen + Math.sign(distance)*step;
        const smoothLid = lidOpen*lidOpen*(3-2*lidOpen);
        const text = terminal ? GetText() : null;
        if (draw) draw(text, elevation, yaw, displayImage, smoothLid, zoom);
        else if (fallback.textContent !== text) fallback.textContent = text;
        if (terminal || lidOpen !== lidTarget) schedule();
    }
    canvas.addEventListener("webglcontextrestored", schedule);
    new ResizeObserver(schedule).observe(canvas);
    window.addEventListener("resize", schedule);

    function focusDisplay() {
        (draw ? canvas : fallback).focus({preventScroll:true});
    }
    function setLid(value) {
        if (lidOpen === lidTarget) lastTime = performance.now();
        lidTarget = value;
        lidButton.textContent = value ? "Close lid" : "Open lid";
        schedule();
    }
    function setTerminal(value) {
        terminal = value;
        screenButton.textContent = value ? "Show wallpaper" : "Use terminal";
        hint.hidden = value;
        if (value) {
            setLid(1);
            yaw = 0.90; elevation = 0; zoom = 1;
        }
        lastTime = performance.now();
        setAudio(value);
        focusDisplay();
        schedule();
    }

    open.onclick = () => {
        if (!wallpaper.src) {
            wallpaper.src = "/Images/legion-wallpaper.webp";
            wallpaper.decode().then(() => {
                displayImage = wallpaper;
                schedule();
            }).catch(() => {
                if (State === "Retro" && !terminal) setTerminal(true);
            });
        }
        if (draw === undefined) {
            try { draw = createLegionRenderer(canvas); }
            catch (error) { console.error("Unable to initialize the Legion viewer", error); draw = null; }
        }
        State = "Retro";
        document.documentElement.dataset.terminalMode = "retro";
        portfolio.inert = true;
        fallback.hidden = Boolean(draw);
        canvas.style.visibility = draw ? "" : "hidden";
        screenButton.hidden = lidButton.hidden = !draw;
        yaw = 0; elevation = 0; zoom = lidOpen = 1;
        setLid(1);
        setTerminal(!draw || (wallpaper.complete && !wallpaper.naturalWidth));
    };
    close.onclick = () => {
        State = "Modern";
        cancelAnimationFrame(frame);
        frame = 0;
        pointers.clear();
        setAudio(false);
        fallback.hidden = true;
        document.documentElement.dataset.terminalMode = "modern";
        portfolio.inert = false;
        open.focus({preventScroll:true});
    };
    screenButton.onclick = () => setTerminal(!terminal);
    lidButton.onclick = () => {
        const next = 1-lidTarget;
        if (terminal) setTerminal(false);
        setLid(next);
        focusDisplay();
    };

    canvas.addEventListener("pointerdown", event => {
        if (event.button !== 0) return;
        canvas.setPointerCapture(event.pointerId);
        pointers.set(event.pointerId, [event.clientX, event.clientY]);
        focusDisplay();
    });
    canvas.addEventListener("pointermove", event => {
        const previous = pointers.get(event.pointerId);
        if (!previous) return;
        const point = [event.clientX, event.clientY];
        pointers.set(event.pointerId, point);
        if (pointers.size === 1) {
            yaw += (point[0]-previous[0])*2*Math.PI/canvas.clientWidth;
            elevation = clamp(elevation+(previous[1]-point[1])*3/canvas.clientHeight, -1.82, 1.23);
        } else if (pointers.size === 2) {
            const other = [...pointers.entries()].find(([id]) => id !== event.pointerId)[1];
            const span = p => Math.hypot(other[0]-p[0], other[1]-p[1]);
            if (span(previous) > 1) zoom = clamp(zoom*span(point)/span(previous), 0.8, 2.4);
        }
        schedule();
    });
    canvas.addEventListener("lostpointercapture", event => pointers.delete(event.pointerId));
    function wheel(event) {
        event.preventDefault();
        if (terminal) scrollTerminal(event.deltaY);
        else {
            const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? canvas.clientHeight : 1);
            zoom = clamp(zoom*Math.exp(-pixels*0.0012), 0.8, 2.4);
        }
        schedule();
    }
    canvas.addEventListener("wheel", wheel, {passive:false});
    fallback.addEventListener("wheel", wheel, {passive:false});

    function keydown(event) {
        if (event.isComposing || event.altKey || event.metaKey) return;
        if (event.key === "Tab" && (!terminal || !InputText || event.shiftKey)) return;
        if (!terminal) {
            if (event.key === "Escape") { close.click(); return; }
            if (event.key === "ArrowLeft") yaw -= 0.12;
            else if (event.key === "ArrowRight") yaw += 0.12;
            else if (event.key === "ArrowUp") elevation = clamp(elevation+0.12, -1.82, 1.23);
            else if (event.key === "ArrowDown") elevation = clamp(elevation-0.12, -1.82, 1.23);
            else if (event.key === "+" || event.key === "=") zoom = clamp(zoom*1.12, 0.8, 2.4);
            else if (event.key === "-") zoom = clamp(zoom/1.12, 0.8, 2.4);
            else if (event.key.length === 1 || event.key === "Enter") {
                setTerminal(true);
                // Direct typing at the product view starts a ready command prompt.
                if (Time <= 5) { Time = 5.01; BootSequence(); }
                if (event.key !== "Enter") KeyPressed(event.key);
            } else return;
        } else {
            if (event.key !== "Enter" && !event.repeat) {
                keySound.currentTime = 0;
                keySound.play().catch(() => {});
            }
            KeyPressed(event.key);
        }
        event.preventDefault();
        schedule();
    }
    canvas.addEventListener("keydown", keydown);
    fallback.addEventListener("keydown", keydown);
})();
