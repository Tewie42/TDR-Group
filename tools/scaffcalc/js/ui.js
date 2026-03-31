// ------------------------------------------------------
// S C A F F C A L C   U I   U P D A T E S
// ------------------------------------------------------

function updateSummary() {

    // Width = sum of bay widths
    project.totalWidthM = project.bays.reduce((sum, b) => sum + b.widthM, 0);

    // Height = tallest bay
    project.totalHeightM = Math.max(...project.bays.map(b => b.heightM), 0);

    // Platform levels = height / lift height
    project.platformLevels = Math.floor(project.totalHeightM / project.liftHeightM);

    // Run Kwikstage calculations
    const results = calculateMaterials({
        grid: project.bays,
        totalWidthM: project.totalWidthM,
        totalHeightM: project.totalHeightM,
        liftHeightM: project.liftHeightM,
        platformLevels: project.platformLevels
    });

    // Update UI
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
}
