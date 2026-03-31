// ------------------------------------------------------
// SCAFFCALC UI CONTROLLER
// ------------------------------------------------------

// Handle view switching (top / side)
document.getElementById("viewMode").addEventListener("change", function (e) {
    currentView = e.target.value;
    render();
});

// Handle manual height input
document.getElementById("heightInput").addEventListener("input", function (e) {
    project.totalHeightM = parseFloat(e.target.value) || 0;
    project.platformLevels = Math.floor(project.totalHeightM / project.liftHeightM);
    updateSummary();
});

// Handle grid size change (optional future feature)
document.getElementById("gridSize").addEventListener("change", function (e) {
    meterSizePx = parseFloat(e.target.value) * 50; // 1m = 50px baseline
    render();
});

// ------------------------------------------------------
// UPDATE SUMMARY PANEL
// ------------------------------------------------------
function updateSummary() {

    // Width = sum of bay widths
    project.totalWidthM = project.bays.reduce((sum, b) => sum + b.widthM, 0);

    // Height = manual input (top view)
    project.platformLevels = Math.floor(project.totalHeightM / project.liftHeightM);

    // Run Kwikstage calculations
    const results = calculateMaterials({
        grid: project.bays,
        totalWidthM: project.totalWidthM,
        totalHeightM: project.totalHeightM,
        liftHeightM: project.liftHeightM,
        platformLevels: project.platformLevels
    });

    // Update UI fields
    document.getElementById("totalWidth").textContent = project.totalWidthM.toFixed(1);
    document.getElementById("totalHeight").textContent = project.totalHeightM.toFixed(1);
    document.getElementById("bayCount").textContent = results.bayCount;
    document.getElementById("liftCount").textContent = project.platformLevels;
    document.getElementById("platformCount").textContent = project.platformLevels;

    document.getElementById("stdCount").textContent = results.standards;
    document.getElementById("ledgerCount").textContent = results.ledgers;
    document.getElementById("transomCount").textContent = results.transoms;
    document.getElementById("braceCount").textContent = results.braces;
    document.getElementById("deckCount").textContent = results.platforms;

    document.getElementById("totalWeight").textContent = results.totalTons;
    document.getElementById("manHours").textContent = results.manHours;

    // ------------------------------------------------------
    // STABILITY CHECK
    // ------------------------------------------------------
    const baseWidth = project.totalWidthM;
    const height = project.totalHeightM;

    let stabilityWarning = "";

    if (baseWidth > 0 && height > baseWidth * 3) {
        const requiredBase = (height / 3).toFixed(1);
        stabilityWarning = `⚠️ Base too narrow. Increase width to at least ${requiredBase}m or add ties/out-riggers.`;
    } else {
        stabilityWarning = "Stable within standard height-to-base ratio.";
    }

    document.getElementById("stabilityWarning").textContent = stabilityWarning;
}
    document.querySelector(".export-btn").addEventListener("click", exportPDF);
function exportPDF() {
    const content = `
TDR Group - Scaffcalc Report

Project: ${document.getElementById("projectName").value}

----------------------------------------
DIMENSIONS
----------------------------------------
Total Width: ${project.totalWidthM.toFixed(1)} m
Total Height: ${project.totalHeightM.toFixed(1)} m
Bays: ${project.bays.length}
Lifts: ${project.platformLevels}
Platforms: ${project.platformLevels}

----------------------------------------
MATERIALS
----------------------------------------
Standards: ${document.getElementById("stdCount").textContent}
Ledgers: ${document.getElementById("ledgerCount").textContent}
Transoms: ${document.getElementById("transomCount").textContent}
Braces: ${document.getElementById("braceCount").textContent}
Platforms: ${document.getElementById("deckCount").textContent}

----------------------------------------
TOTALS
----------------------------------------
Weight: ${document.getElementById("totalWeight").textContent} tons
Estimated Man-Hours: ${document.getElementById("manHours").textContent}

----------------------------------------
STABILITY
----------------------------------------
${document.getElementById("stabilityWarning").textContent}
`;

    const blob = new Blob([content], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "scaffcalc_report.pdf";
    a.click();

    URL.revokeObjectURL(url);
}
