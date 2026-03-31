// ------------------------------------------------------
// S C A F F C A L C   C A L C U L A T I O N   E N G I N E
// ------------------------------------------------------

function calculateMaterials(project) {

    const grid = project.grid; // array of bays
    const liftHeight = project.liftHeightM || 2; // default 2m
    const lifts = Math.ceil(project.totalHeightM / liftHeight);

    // -----------------------------
    // BAY COUNT
    // -----------------------------
    const bayCount = grid.length;

    // -----------------------------
    // STANDARDS
    // 4 standards per bay per lift
    // -----------------------------
    const standards = bayCount * lifts * 4;

    // -----------------------------
    // LEDGERS
    // 2 ledgers per bay per lift (front + back)
    // -----------------------------
    const ledgers = bayCount * lifts * 2;

    // -----------------------------
    // TRANSOMS
    // 2 transoms per bay per lift (left + right)
    // -----------------------------
    const transoms = bayCount * lifts * 2;

    // -----------------------------
    // BRACES
    // 1 brace per 3 bays per lift
    // -----------------------------
    const braces = Math.ceil((bayCount / 3) * lifts);

    // -----------------------------
    // PLATFORMS
    // 1 platform per bay per platform level
    // -----------------------------
    const platforms = bayCount * project.platformLevels;

    // -----------------------------
    // TONNAGE
    // -----------------------------
    const totalWeightKg =
        (standards * Kwikstage.standards.weightKg[2]) +
        (ledgers * Kwikstage.ledgers.weightKg[2.4]) +
        (transoms * Kwikstage.transoms.weightKg[1.2]) +
        (braces * Kwikstage.braces.weightKg[3]) +
        (platforms * Kwikstage.platforms.weightKg[2.4]);

    const totalTons = (totalWeightKg / 1000).toFixed(2);

    // -----------------------------
    // MAN HOURS
    // 0.15 hours per m² (industry average)
    // -----------------------------
    const area = project.totalWidthM * project.totalHeightM;
    const manHours = (area * 0.15).toFixed(1);

    return {
        bayCount,
        standards,
        ledgers,
        transoms,
        braces,
        platforms,
        totalTons,
        manHours
    };
}
