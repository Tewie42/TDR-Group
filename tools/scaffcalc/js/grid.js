// ------------------------------------------------------
// SCAFFCALC GRID + BAY DRAWING + SIDE VIEW
// ------------------------------------------------------

// Canvas setup
const canvas = document.getElementById("scaffCanvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.parentElement.clientWidth;
canvas.height = canvas.parentElement.clientHeight;

// GLOBAL STATE
let currentView = "top";          // "top" or "side"
let meterSizePx = 50;             // 1m = 50px (updated by scaling)
let bays = [];                    // top-view bays
let selectedBay = null;           // selected bay for delete
let isDrawing = false;            // drawing state
let startX = 0;
let startY = 0;

// ------------------------------------------------------
// SNAP TO GRID
// ------------------------------------------------------
function snap(value) {
    return Math.round(value / meterSizePx) * meterSizePx;
}

// ------------------------------------------------------
// TOP VIEW GRID
// ------------------------------------------------------
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;

    const totalWidthPx = project.totalWidthM * meterSizePx || (20 * meterSizePx);

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
// DRAW BAYS (TOP VIEW)
// ------------------------------------------------------
function drawBays() {
    ctx.fillStyle = "rgba(30, 115, 255, 0.35)";
    ctx.strokeStyle = "#1E73FF";
    ctx.lineWidth = 2;

    bays.forEach(b => {
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeRect(b.x, b.y, b.w, b.h);
    });

    // Highlight selected bay
    if (selectedBay) {
        ctx.strokeStyle = "#E53935";
        ctx.lineWidth = 3;
        ctx.strokeRect(selectedBay.x, selectedBay.y, selectedBay.w, selectedBay.h);
    }
}

// ------------------------------------------------------
// SIDE VIEW GRID
// ------------------------------------------------------
function drawSideGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;

    const px = meterSizePx;
    const totalHeightPx = project.totalHeightM * px;

    // Horizontal lift lines
    for (let y = 0; y <= totalHeightPx; y += project.liftHeightM * px) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - y);
        ctx.lineTo(canvas.width, canvas.height - y);
        ctx.stroke();
    }

    // Vertical bay lines (matching top view)
    let x = 0;
    project.bays.forEach(b => {
        const w = b.widthM * px;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();

        x += w;
    });

    // Right boundary
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
}

// ------------------------------------------------------
// SIDE VIEW DRAWING
// ------------------------------------------------------
function drawSideView() {
    const px = meterSizePx;
    let x = 0;

    project.bays.forEach(b => {
        const w = b.widthM * px;
        const h = project.totalHeightM * px;

        // Standards
        ctx.strokeStyle = "#1E73FF";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(x, canvas.height);
        ctx.lineTo(x, canvas.height - h);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + w, canvas.height);
        ctx.lineTo(x + w, canvas.height - h);
        ctx.stroke();

        // Platforms + Guardrails + Toe-boards
        for (let i = 1; i <= project.platformLevels; i++) {
            const platformY = canvas.height - (i * project.liftHeightM * px);

            // Platform deck
            ctx.strokeStyle = "#1E73FF";
            ctx.beginPath();
            ctx.moveTo(x, platformY);
            ctx.lineTo(x + w, platformY);
            ctx.stroke();

            // Guardrails (1m and 1.5m above platform)
            const guardrail1 = platformY - (1 * px);
            const guardrail2 = platformY - (1.5 * px);

            ctx.strokeStyle = "#E53935"; // red
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(x, guardrail1);
            ctx.lineTo(x + w, guardrail1);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, guardrail2);
            ctx.lineTo(x + w, guardrail2);
            ctx.stroke();

            // Toe-board (0.15m above platform)
            const toeboardY = platformY - (0.15 * px);

            ctx.strokeStyle = "#6E6E6E"; // grey
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.moveTo(x, toeboardY);
            ctx.lineTo(x + w, toeboardY);
            ctx.stroke();
        }

        // Ladder (centered in bay)
        ctx.strokeStyle = "#8B4513"; // brown
        ctx.lineWidth = 3;

        const ladderX = x + w / 2;

        for (let i = 0; i < project.platformLevels; i++) {
            const bottom = canvas.height - (i * project.liftHeightM * px);
            const top = canvas.height - ((i + 1) * project.liftHeightM * px);

            ctx.beginPath();
            ctx.moveTo(ladderX, bottom);
            ctx.lineTo(ladderX, top);
            ctx.stroke();
        }

        x += w;
    });
}

// ------------------------------------------------------
// BACKGROUND IMAGE (from image-scale.js)
// ------------------------------------------------------
function drawBackground() {
    if (!bgImage) return;

    ctx.globalAlpha = bgOpacity;
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;
}

// ------------------------------------------------------
// RENDER SWITCH
// ------------------------------------------------------
function render() {
    drawBackground();

    if (currentView === "top") {
        drawGrid();
        drawBays();
    }

    if (currentView === "side") {
        drawSideGrid();
        drawSideView();
    }
}

// ------------------------------------------------------
// BAY CLICK DETECTION
// ------------------------------------------------------
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
// MOUSE EVENTS (TOP VIEW ONLY)
// ------------------------------------------------------
canvas.addEventListener("mousedown", (e) => {
    if (currentView !== "top") return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Select bay
    const clickedBay = getBayAt(mouseX, mouseY);
    if (clickedBay) {
        selectedBay = clickedBay;
        render();
        return;
    }

    // Start drawing
    selectedBay = null;
    isDrawing = true;

    startX = snap(mouseX);
    startY = snap(mouseY);
});

canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing || currentView !== "top") return;

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
    if (!isDrawing || currentView !== "top") return;
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
        project.bays = bays;
        updateSummary();
    }

    render();
});

// ------------------------------------------------------
// DELETE SELECTED BAY
// ------------------------------------------------------
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

// Initial render
render();
