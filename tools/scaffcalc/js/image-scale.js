// ------------------------------------------------------
// S C A F F C A L C   I M A G E   S C A L I N G
// ------------------------------------------------------

let bgImage = null;
let bgOpacity = 0.5;
let scaleMode = false;
let scalePoints = [];
let pixelsPerMeter = 50; // default (1m = 50px)

// Load background image
document.getElementById("bgUpload").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        bgImage = img;
        render();
    };
    img.src = URL.createObjectURL(file);
});

// Opacity slider
document.getElementById("opacitySlider").addEventListener("input", function (e) {
    bgOpacity = e.target.value / 100;
    render();
});

// Enable scale mode
document.getElementById("setScaleBtn").addEventListener("click", () => {
    scaleMode = true;
    scalePoints = [];
    alert("Click two points on the image that are exactly 1 meter apart.");
});

// Capture scale points
canvas.addEventListener("click", (e) => {
    if (!scaleMode) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    scalePoints.push({ x, y });

    // Draw marker
    ctx.fillStyle = "#E53935";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    // If two points selected → calculate scale
    if (scalePoints.length === 2) {
        const dx = scalePoints[1].x - scalePoints[0].x;
        const dy = scalePoints[1].y - scalePoints[0].y;
        const pixelDistance = Math.sqrt(dx * dx + dy * dy);

        pixelsPerMeter = pixelDistance; // 1m = pixelDistance px
        meterSizePx = pixelsPerMeter;

        scaleMode = false;
        alert(`Scale set: 1 meter = ${pixelsPerMeter.toFixed(1)} pixels`);

        render();
    }
});

// Draw background image behind grid
function drawBackground() {
    if (!bgImage) return;

    ctx.globalAlpha = bgOpacity;
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;
}
