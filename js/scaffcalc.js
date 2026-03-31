const canvas = document.getElementById("scaffCanvas");
const ctx = canvas.getContext("2d");

// Fullscreen canvas
canvas.width = canvas.parentElement.clientWidth;
canvas.height = canvas.parentElement.clientHeight;

// Default grid size (1m)
let gridSize = 50; // 50px = 1m on screen

// Draw 20m wide grid
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;

    const totalMeters = 20;
    const totalPixels = totalMeters * gridSize;

    for (let x = 0; x <= totalPixels; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(totalPixels, y);
        ctx.stroke();
    }
}

drawGrid();
