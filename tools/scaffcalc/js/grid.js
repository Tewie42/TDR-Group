// ------------------------------------------------------
// SCAFFCALC — OPTIMIZED MULTI-LAYER GRID ENGINE
// ------------------------------------------------------

// FIXED CANVAS SIZE (50m × 30px = 1500px)
const canvas = document.getElementById("scaffCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1500;
canvas.height = 1500;

// LIGHT GREY BACKGROUND
canvas.style.background = "#f5f5f5";

// SCALE
const meterSizePx = 30;

// GLOBAL STATE
let bays = [];
let selectedBay = null;
let isDrawing = false;
let startX = 0;
let startY = 0;
let previewW = 0;
let previewH = 0;
let currentView = "top";

let needsRedraw = true;

// ------------------------------------------------------
// OFFSCREEN LAYERS
// ------------------------------------------------------
let bgCanvas = document.createElement("canvas");
let bgCtx = bgCanvas.getContext("2d");

let gridCanvas = document.createElement("canvas");
let gridCtx = gridCanvas.getContext("2d");

let baysCanvas = document.createElement("canvas");
let baysCtx = baysCanvas.getContext("2d");

let sideCanvas = document.createElement("canvas");
let sideCtx = sideCanvas.getContext("2d");

let outriggersCanvas = document.createElement("canvas");
let outriggersCtx = outriggersCanvas.getContext("2d");

// ------------------------------------------------------
// BUILD GRID (50 × 50)
// ------------------------------------------------------
function buildGrid() {
    gridCanvas.width = canvas.width;
    gridCanvas.height = canvas.height;

    gridCtx.strokeStyle = "#e0e0e0";
    gridCtx.lineWidth = 1;

    for (let x = 0; x <= 1500; x += meterSizePx) {
        gridCtx.beginPath();
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, 1500);
        gridCtx.stroke();
    }

    for (let y = 0; y <= 1500; y += meterSizePx) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(1500, y);
        gridCtx.stroke();
    }
}

// ------------------------------------------------------
// BACKGROUND IMAGE (PRE-SCALED ONCE)
// ------------------------------------------------------
let bgImage = null;
let bgOpacity = 0.5;

function setBackground(img) {
    bgCanvas.width = canvas.width;
    bgCanvas.height = canvas.height;

    bgCtx.clearRect(0, 0, 1500, 1500);
    bgCtx.globalAlpha = bgOpacity;
    bgCtx.drawImage(img, 0, 0, 1500, 1500);

    bgImage = bgCanvas;
    needsRedraw = true;
}

// ------------------------------------------------------
// SNAP TO GRID
// ------------------------------------------------------
function snap(v) {
    return Math.round(v / meterSizePx) * meterSizePx;
}

// ------------------------------------------------------
// REBUILD BAYS LAYER
// ------------------------------------------------------
function rebuildBays() {
    baysCanvas.width = 1500;
    baysCanvas.height = 1500;

    baysCtx.clearRect(0, 0, 1500, 1500);

    baysCtx.fillStyle = "rgba(30,115,255,0.35)";
    baysCtx.strokeStyle = "#1E73FF";
    baysCtx.lineWidth = 2;

    bays.forEach(b => {
        baysCtx.fillRect(b.x, b.y, b.w, b.h);
        baysCtx.strokeRect(b.x, b.y, b.w, b.h);
    });
}

// ------------------------------------------------------
// REBUILD SIDE VIEW LAYER
// ------------------------------------------------------
function rebuildSideView() {
    sideCanvas.width = 1500;
    sideCanvas.height = 1500;

    sideCtx.clearRect(0, 0, 1500, 1500);

    const px = meterSizePx;
    let x = 0;

    project.bays.forEach(b => {
        const w = b.widthM * px;
        const h = project.totalHeightM * px;

        // Standards
        sideCtx.strokeStyle = "#1E73FF";
        sideCtx.lineWidth = 2;

        sideCtx.beginPath();
        sideCtx.moveTo(x, 1500);
        sideCtx.lineTo(x, 1500 - h);
        sideCtx.stroke();

        sideCtx.beginPath();
        sideCtx.moveTo(x + w, 1500);
        sideCtx.lineTo(x + w, 1500 - h);
        sideCtx.stroke();

        // Platforms + Guardrails + Toe-boards
        for (let i = 1; i <= project.platformLevels; i++) {
            const y = 1500 - (i * project.liftHeightM * px);

            // Platform
            sideCtx.strokeStyle = "#1E73FF";
            sideCtx.beginPath();
            sideCtx.moveTo(x, y);
            sideCtx.lineTo(x + w, y);
            sideCtx.stroke();

            // Guardrails
            sideCtx.strokeStyle = "#E53935";
            sideCtx.lineWidth = 2;

            const g1 = y - (1 * px);
            const g2 = y - (1.5 * px);

            sideCtx.beginPath();
            sideCtx.moveTo(x, g1);
            sideCtx.lineTo(x + w, g1);
            sideCtx.stroke();

            sideCtx.beginPath();
            sideCtx.moveTo(x, g2);
            sideCtx.lineTo(x + w, g2);
            sideCtx.stroke();

            // Toe-board
            sideCtx.strokeStyle = "#6E6E6E";
            sideCtx.lineWidth = 3;

            const tb = y - (0.15 * px);

            sideCtx.beginPath();
            sideCtx.moveTo(x, tb);
            sideCtx.lineTo(x + w, tb);
            sideCtx.stroke();
        }

        // Ladder
        sideCtx.strokeStyle = "#8B4513";
        sideCtx.lineWidth = 3;

        const ladderX = x + w / 2;

        for (let i = 0; i < project.platformLevels; i++) {
            const bottom = 1500 - (i * project.liftHeightM * px);
            const top = 1500 - ((i + 1) * project.liftHeightM * px);

            sideCtx.beginPath();
            sideCtx.moveTo(ladderX, bottom);
            sideCtx.lineTo(ladderX, top);
            sideCtx.stroke();
        }

        x += w;
    });
}

// ------------------------------------------------------
// REBUILD OUTRIGGERS LAYER
// ------------------------------------------------------
function rebuildOutriggers() {
    outriggersCanvas.width = 1500;
    outriggersCanvas.height = 1500;

    outriggersCtx.clearRect(0, 0, 1500, 1500);

    if (!project.outriggers.required) return;

    const px = meterSizePx;
    const lengthPx = project.outriggers.lengthM * px;

    let x = 0;

    project.bays.forEach(b => {
        const w = b.widthM * px;

        // SIDE VIEW OUTRIGGERS
        outriggersCtx.strokeStyle = "#FF9800";
        outriggersCtx.lineWidth = 3;

        // Left
        outriggersCtx.beginPath();
        outriggersCtx.moveTo(x, 1500);
        outriggersCtx.lineTo(x - lengthPx, 1500);
        outriggersCtx.stroke();

        outriggersCtx.beginPath();
        outriggersCtx.moveTo(x, 1500);
        outriggersCtx.lineTo(x - lengthPx, 1500 - (lengthPx * 0.5));
        outriggersCtx.stroke();

        // Right
        outriggersCtx.beginPath();
        outriggersCtx.moveTo(x + w, 1500);
        outriggersCtx.lineTo(x + w + lengthPx, 1500);
        outriggersCtx.stroke();

        outriggersCtx.beginPath();
        outriggersCtx.moveTo(x + w, 1500);
        outriggersCtx.lineTo(x + w + lengthPx, 1500 - (lengthPx * 0.5));
        outriggersCtx.stroke();

        x += w;
    });
}

// ------------------------------------------------------
// MAIN RENDER LOOP
// ------------------------------------------------------
function render() {
    ctx.clearRect(0, 0, 1500, 1500);

    if (bgImage) ctx.drawImage(bgCanvas, 0, 0);
    ctx.drawImage(gridCanvas, 0, 0);

    if (currentView === "top") {
        ctx.drawImage(baysCanvas, 0, 0);
        ctx.drawImage(outriggersCanvas, 0, 0);

        // LIVE PREVIEW
        if (isDrawing) {
            ctx.fillStyle = "rgba(229,57,53,0.25)";
            ctx.strokeStyle = "#E53935";
            ctx.lineWidth = 2;

            ctx.fillRect(startX, startY, previewW, previewH);
            ctx.strokeRect(startX, startY, previewW, previewH);
        }
    }

    if (currentView === "side") {
        ctx.drawImage(sideCanvas, 0, 0);
        ctx.drawImage(outriggersCanvas, 0, 0);
    }
}

function animationLoop() {
    if (needsRedraw) {
        render();
        needsRedraw = false;
    }
    requestAnimationFrame(animationLoop);
}

// ------------------------------------------------------
// BAY SELECTION
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
canvas.addEventListener("mousedown", e => {
    if (currentView !== "top") return;

    const rect = canvas.getBoundingClientRect();
    const mx = snap(e.clientX - rect.left);
    const my = snap(e.clientY - rect.top);

    const hit = getBayAt(mx, my);
    if (hit) {
        selectedBay = hit;
        needsRedraw = true;
        return;
    }

    selectedBay = null;
    isDrawing = true;

    startX = mx;
    startY = my;
});

canvas.addEventListener("mousemove", e => {
    if (!isDrawing || currentView !== "top") return;

    const rect = canvas.getBoundingClientRect();
    const mx = snap(e.clientX - rect.left);
    const my = snap(e.clientY - rect.top);

    previewW = mx - startX;
    previewH = my - startY;

    needsRedraw = true;
});

canvas.addEventListener("mouseup", e => {
    if (!isDrawing || currentView !== "top") return;
    isDrawing = false;

    const rect = canvas.getBoundingClientRect();
    const mx = snap(e.clientX - rect.left);
    const my = snap(e.clientY - rect.top);

    const w = mx - startX;
    const h = my - startY;

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

        rebuildBays();
        rebuildSideView();
        rebuildOutriggers();
        updateSummary();
    }

    needsRedraw = true;
});

// ------------------------------------------------------
// DELETE SELECTED BAY
// ------------------------------------------------------
document.addEventListener("keydown", e => {
    if ((e.key === "Delete" || e.key === "Backspace") && selectedBay) {
        bays = bays.filter(b => b !== selectedBay);
        project.bays = bays;

        selectedBay = null;

        rebuildBays();
        rebuildSideView();
        rebuildOutriggers();
        updateSummary();

        needsRedraw = true;
    }
});

// ------------------------------------------------------
// INITIALIZE
// ------------------------------------------------------
buildGrid();
rebuildBays();
rebuildSideView();
rebuildOutriggers();
needsRedraw = true;
animationLoop();
