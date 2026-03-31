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
let selectedBay = null;
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
function getBayAt(x, y) {
    for (let i = bays.length - 1; i >= 0; i--) {
        const b = bays[i];
        if (x >= b.x && x <= b.x + b.w &&
            y >= b.y && y <= b.y + b.h) {
            return b;
        }
    }
    return null;
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
   // Highlight selected bay
if (selectedBay) {
    ctx.strokeStyle = "#E53935";
    ctx.lineWidth = 3;
    ctx.strokeRect(selectedBay.x, selectedBay.y, selectedBay.w, selectedBay.h);
    updateSummary();

} });
}

// ------------------------------------------------------
// MAIN DRAW LOOP
// ------------------------------------------------------
function render() {
    drawBackground();
    drawGrid();
    drawBays();
}

render();

// ------------------------------------------------------
// MOUSE EVENTS
// ------------------------------------------------------
canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if clicking an existing bay
    const clickedBay = getBayAt(mouseX, mouseY);
    if (clickedBay) {
        selectedBay = clickedBay;
        render();
        return; // do NOT start drawing
    }

    // Otherwise start drawing a new bay
    selectedBay = null;
    isDrawing = true;

    startX = snap(mouseX);
    startY = snap(mouseY);
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
    const bay = {
        x: startX,
        y: startY,
        w: w,
        h: h,
        widthM: Math.abs(w / meterSizePx),
        heightM: Math.abs(h / meterSizePx)
    };

    bays.push(bay);
    project.bays = bays; // sync with global project state
    updateSummary();     // update right panel
}
    render();
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedBay) {
            bays = bays.filter(b => b !== selectedBay);
            project.bays = bays;
            selectedBay = null;
            updateSummary();
            render();
        }
    }
});
