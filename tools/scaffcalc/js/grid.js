// ------------------------------------------------------
// SCAFFCALC GRID + BAY DRAWING + SIDE VIEW (OPTIMIZED)
// ------------------------------------------------------

// Canvas setup
const canvas = document.getElementById("scaffCanvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.parentElement.clientWidth;
canvas.height = canvas.parentElement.clientHeight;

// GLOBAL STATE
let currentView = "top";          
let meterSizePx = 50;             
let bays = [];                    
let selectedBay = null;           
let isDrawing = false;            
let startX = 0;
let startY = 0;

let needsRedraw = true; // <— DIRTY FLAG

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
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;

    const totalWidthPx = project.totalWidthM * meterSizePx || (20 * meterSizePx);

    for (let x = 0; x <= totalWidthPx; x += meterSizePx) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

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

    if (selectedBay) {
        ctx.strokeStyle = "#E53935";
        ctx.lineWidth = 3;
        ctx.strokeRect(selectedBay.x, selectedBay.y, selectedBay.w, selectedBay.h);
    }
}

// ------------------------------------------------------
// OUTRIGGERS (TOP VIEW)
// ------------------------------------------------------
function drawOutriggersTopView() {
    if (!project.outriggers.required) return;

    const px = meterSizePx;
    const lengthPx = project.outriggers.lengthM * px;

    bays.forEach(b => {
        const leftX = b.x;
        const rightX = b.x + b.w;
        const y = b.y + b.h;

        ctx.strokeStyle = "#FF9800";
        ctx.lineWidth = 2;

        // Left triangle
        ctx.beginPath();
        ctx.moveTo(leftX, y);
        ctx.lineTo(leftX - lengthPx, y + lengthPx);
        ctx.lineTo(leftX, y + lengthPx);
        ctx.closePath();
        ctx.stroke();

        // Right triangle
        ctx.beginPath();
        ctx.moveTo(rightX, y);
        ctx.lineTo(rightX + lengthPx, y + lengthPx);
        ctx.lineTo(rightX, y + lengthPx);
        ctx.closePath();
        ctx.stroke();
    });
}

// ------------------------------------------------------
// SIDE VIEW GRID
// ------------------------------------------------------
function drawSideGrid() {
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;

    const px = meterSizePx;
    const totalHeightPx = project.totalHeightM * px;

    for (let y = 0; y <= totalHeightPx; y += project.liftHeightM * px) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - y);
        ctx.lineTo(canvas.width, canvas.height - y);
        ctx.stroke();
    }

    let x = 0;
    project.bays.forEach(b => {
        const w = b.widthM * px;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();

        x += w;
    });

    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
}

// ------------------------------------------------------
// SIDE VIEW DRAWING (Platforms, Guardrails, Toe-boards, Ladders)
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

            // Platform
            ctx.strokeStyle = "#1E73FF";
            ctx.beginPath();
            ctx.moveTo(x, platformY);
            ctx.lineTo(x + w, platformY);
            ctx.stroke();

            // Guardrails
            ctx.strokeStyle = "#E53935";
            ctx.lineWidth = 2;

            const g1 = platformY - (1 * px);
            const g2 = platformY - (1.5 * px);

            ctx.beginPath();
            ctx.moveTo(x, g1);
            ctx.lineTo(x + w, g1);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, g2);
            ctx.lineTo(x + w, g2);
            ctx.stroke();

            // Toe-board
            ctx.strokeStyle = "#6E6E6E";
            ctx.lineWidth = 3;

            const tb = platformY - (0.15 * px);

            ctx.beginPath();
            ctx.moveTo(x, tb);
            ctx.lineTo(x + w, tb);
            ctx.stroke();
        }

        // Ladder
        ctx.strokeStyle = "#8B4513";
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
// OUTRIGGERS (SIDE VIEW)
// ------------------------------------------------------
function drawOutriggersSideView() {
    if (!project.outriggers.required) return;

    const px = meterSizePx;
    const lengthPx = project.outriggers.lengthM * px;

    let x = 0;

    project.bays.forEach(b => {
        const w = b.widthM * px;
        const baseY = canvas.height;

        ctx.strokeStyle = "#FF9800";
        ctx.lineWidth = 3;

        // Left
        ctx.beginPath();
        ctx.moveTo(x, baseY);
        ctx.lineTo(x - lengthPx, baseY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, baseY);
        ctx.lineTo(x - lengthPx, baseY - (lengthPx * 0.5));
        ctx.stroke();

        // Right
        ctx.beginPath();
        ctx.moveTo(x + w, baseY);
        ctx.lineTo(x + w + lengthPx, baseY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + w, baseY);
        ctx.lineTo(x + w + lengthPx, baseY - (lengthPx * 0.5));
        ctx.stroke();

        x += w;
    });
}

// ------------------------------------------------------
// BACKGROUND IMAGE
// ------------------------------------------------------
function drawBackground() {
    if (!bgImage) return;

    ctx.save();
    ctx.globalAlpha = bgOpacity;
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    ctx.restore();
}

// ------------------------------------------------------
// RENDER (Optimized)
// ------------------------------------------------------
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();

    if (currentView === "top") {
        drawGrid();
        drawBays();
        drawOutriggersTopView();
    }

    if (currentView === "side") {
        drawSideGrid();
        drawSideView();
        drawOutriggersSideView();
    }
}

// ------------------------------------------------------
// ANIMATION LOOP (Smooth Rendering)
// ------------------------------------------------------
function animationLoop() {
    if (needsRedraw) {
        render();
        needsRedraw = false;
    }
    requestAnimationFrame(animationLoop);
}

animationLoop();

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

    const clickedBay = getBayAt(mouseX, mouseY);
    if (clickedBay) {
        selectedBay = clickedBay;
        needsRedraw = true;
        return;
    }

    selectedBay = null;
    isDrawing = true;

    startX = snap(mouseX);
    startY = snap(mouseY);
});

canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing || currentView !== "top") return;

    const rect = canvas.getBoundingClientRect();
    const currentX = snap(e.clientX - rect.left);
    const currentY = snap(e.clientY - rect.top);

    needsRedraw = true;

    // Preview rectangle
    render();

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

    needsRedraw = true;
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
            needsRedraw = true;
        }
    }
});

   
