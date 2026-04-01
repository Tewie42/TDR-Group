// ------------------------------------------------------
// IMAGE SCALE / BACKGROUND HANDLER (Optimized Version)
// ------------------------------------------------------

// This file ONLY handles:
// - Background image upload
// - Background opacity slider
// - Passing the image to grid.js (setBackground)

// No scaling mode, no pixel calibration, no render() calls.

// ------------------------------------------------------
// BACKGROUND IMAGE UPLOAD
// ------------------------------------------------------
const bgUpload = document.getElementById("bgUpload");

if (bgUpload) {
    bgUpload.addEventListener("change", e => {
        const file = e.target.files[0];
        if (!file) return;

        const img = new Image();
        img.onload = () => {
            // Pass the image to grid.js
            setBackground(img);
            needsRedraw = true;
        };
        img.src = URL.createObjectURL(file);
    });
}

// ------------------------------------------------------
// BACKGROUND OPACITY SLIDER
// ------------------------------------------------------
const opacitySlider = document.getElementById("opacitySlider");

if (opacitySlider) {
    opacitySlider.addEventListener("input", e => {
        bgOpacity = e.target.value / 100;

        // Rebuild background layer with new opacity
        if (bgImage) {
            setBackground(bgImage);
        }

        needsRedraw = true;
    });
}
