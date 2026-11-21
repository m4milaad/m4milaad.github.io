const Canvas = document.getElementById("Canvas3D");
const drawLegion = createLegionRenderer(Canvas);
let elevation = 0;
let yaw = 0;
let drag = null;

Canvas.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    Canvas.setPointerCapture(event.pointerId);
    Canvas.focus();
    drag = {x:event.clientX, y:event.clientY, elevation, yaw};
});
Canvas.addEventListener("pointermove", event => {
    if (!drag) return;
    elevation = Math.min(1.1, Math.max(-0.20, drag.elevation + (drag.y-event.clientY)/(Canvas.clientHeight*0.32)));
    yaw = drag.yaw + (event.clientX-drag.x)*Math.PI*2/Canvas.clientWidth;
});
Canvas.addEventListener("lostpointercapture", () => {drag=null;});
// Keyboard input hanling // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

// Object to store currrent key state
let CurrentlyPressedKey = null;

// Event listener for keydown
Canvas.addEventListener("keydown", (event) => {
    if (!["Enter", CurrentlyPressedKey].includes(event.key))
    {
        KeyboardPressed.play();
        KeyboardPressed.currentTime = 0;
    }

    CurrentlyPressedKey = event.key;
    KeyPressed(event.key);
    event.preventDefault();
});

// Event listener for keyup
Canvas.addEventListener("keyup", (event) => {
    CurrentlyPressedKey = null;
    event.preventDefault();
});

// Audio stuff // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

// Load all sounds
const ComputerBoot = document.getElementById("ComputerBoot");
const ComputerAmbient = document.getElementById("ComputerAmbient");
const ComputerBeep = document.getElementById("ComputerBeep");
const KeyboardPressed = document.getElementById("KeyboardPressed");

ComputerBoot.volume = 0;
ComputerAmbient.volume = 0;

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

// Add tabindex to make canvas focusable
Canvas.tabIndex = 1;

let Time = 0;
let LastTime = 0;

// Draw the scene
function UpdateScene(CurrentTime)
{
    // Check if this is first render
    if (Time == 0)
    {
        // Play boot and ambient sounds
        ComputerBoot.play();
        ComputerAmbient.play();

        // Make ambient sound repeat
        ComputerAmbient.loop = true;

        // Reset time
        LastTime = CurrentTime * 0.001 - 0.01;
    }

    // Time keeping // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

    CurrentTime *= 0.001; // Convert time to seconds
    const DeltaTime = CurrentTime - LastTime; // Get time since last update
    LastTime = CurrentTime; // Update last time variable
    Time += DeltaTime; // Time accumulator for fixed time step

    if (State !== "Retro") return;
    const text = GetText();
    drawLegion(text, elevation, yaw);
    sceneFrame = requestAnimationFrame(UpdateScene);
}

// None 3d rendering stuff // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

function FadeAudio()
{
    // Fade audio out
    if (State === "Modern")
    {
        ComputerBoot.volume = Math.max(0, ComputerBoot.volume - (0.5 / 30));
        ComputerAmbient.volume = Math.max(0, ComputerAmbient.volume - (0.25 / 30));

        if (ComputerBoot.volume > 0) {requestAnimationFrame(FadeAudio);}
    }

    // Fade audio in
    else
    {
        ComputerBoot.volume = Math.min(0.5, ComputerBoot.volume + (0.5 / 30));
        ComputerAmbient.volume = Math.min(0.25, ComputerAmbient.volume + (0.25 / 30));

        if (ComputerBoot.volume < 0.5) {requestAnimationFrame(FadeAudio);}
    }
}

let State = "Modern";
let sceneFrame = 0;

const MainButton = document.getElementById("MainButton");
const MainDiv = document.getElementById("MainDiv");

const openTerminal = document.getElementById("OpenTerminal");
openTerminal.onclick = () => {
    State = "Retro";
    document.documentElement.dataset.terminalMode = "retro";
    MainDiv.inert = true;
    elevation = 0;
    yaw = 0;
    Canvas.focus({ preventScroll: true });
    sceneFrame = requestAnimationFrame(UpdateScene);
    requestAnimationFrame(FadeAudio);
};
MainButton.onclick = () => {
    State = "Modern";
    document.documentElement.dataset.terminalMode = "modern";
    MainDiv.inert = false;
    cancelAnimationFrame(sceneFrame);
    openTerminal.focus({ preventScroll: true });
    requestAnimationFrame(FadeAudio);
};
