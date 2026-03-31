// ------------------------------------------------------
// S C A F F C A L C   G R I D   +   B A Y   D R A W I N G
// ------------------------------------------------------

const canvas = document.getElementById("scaffCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas to container
canvas.width = canvas.parentElement.clientWidth;
canvas.height = canvas.parentElement.clientHeight;

// GRID SETTINGS
let meterSizePx = 50; // 1m = 50px
let gridWidthM = 20;  // 20m wide scaffold
let gridHeightM = 12; // default height

// PROJECT DATA
let bays = []; // stores drawn bays

// MOUSE STATE
let isDrawing = false;
let startX = 0;
let startY = 0;

// ------------------------------------------------------
// DRAW GRID
// ------------------------------------------------------
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;

    const totalWidthPx = gridWidthM * meterSizePx;

    // Vertical lines
    for (let x = 0; x <= totalWidthPx; x += meterSizePx) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += meterSizePx) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(totalWidthPx, y);
        ctx.stroke();
    }
}

// ------------------------------------------------------
// SNAP TO GRID
// ------------------------------------------------------
function snap(value) {
    return Math.round(value / meterSizePx) * meterSizePx;
}

// ------------------------------------------------------
// DRAW ALL BAYS
// ------------------------------------------------------
function drawBays() {
    ctx.fillStyle = "rgba(30, 115, 255, 0.35)";
    ctx.strokeStyle = "#1E73FF";
    ctx.lineWidth = 2;

    bays.forEach(bay => {
        ctx.fillRect(bay.x, bay.y, bay.w, bay.h);
        ctx.strokeRect(bay.x, bay.y, bay.w, bay.h);
    });
}

// ------------------------------------------------------
// MAIN DRAW LOOP
// ------------------------------------------------------
function render() {
    drawGrid();
    drawBays();
}

render();

// ------------------------------------------------------
// MOUSE EVENTS
// ------------------------------------------------------
canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;

    const rect = canvas.getBoundingClientRect();
    startX = snap(e.clientX - rect.left);
    startY = snap(e.clientY - rect.top);
});

canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;

    render();

    const rect = canvas.getBoundingClientRect();
    const currentX = snap(e.clientX - rect.left);
    const currentY = snap(e.clientY - rect.top);

    const w = currentX - startX;
    const h = currentY - startY;

    ctx.fillStyle = "rgba(229, 57, 53, 0.25)";
    ctx.strokeStyle = "#E53935";
    ctx.lineWidth = 2;

    ctx.fillRect(startX, startY, w, h);
    ctx.strokeRect(startX, startY, w, h);
});

canvas.addEventListener("mouseup", (e) => {
    if (!isDrawing) return;
    isDrawing = false;

    const rect = canvas.getBoundingClientRect();
    const endX = snap(e.clientX - rect.left);
    const endY = snap(e.clientY - rect.top);

    const w = endX - startX;
    const h = endY - startY;

    if (w !== 0 && h !== 0) {
        bays.push({
            x: startX,
            y: startY,
            w: w,
            h: h,
            widthM: Math.abs(w / meterSizePx),
            heightM: Math.abs(h / meterSizePx)
        });
    }

    render();
});
