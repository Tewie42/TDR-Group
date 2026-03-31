// ------------------------------------------------------
// K W I K S T A G E   C O M P O N E N T   L I B R A R Y
// ------------------------------------------------------

const Kwikstage = {

    // Standards (vertical posts)
    standards: {
        lengthsM: [1, 2, 3],
        weightKg: {
            1: 6.5,
            2: 12.5,
            3: 18.0
        }
    },

    // Ledgers (horizontal along scaffold length)
    ledgers: {
        lengthsM: [1.2, 1.8, 2.4],
        weightKg: {
            1.2: 5.5,
            1.8: 7.2,
            2.4: 9.0
        }
    },

    // Transoms (horizontal across scaffold width)
    transoms: {
        lengthsM: [0.7, 1.2, 1.8],
        weightKg: {
            0.7: 4.2,
            1.2: 6.2,
            1.8: 8.1
        }
    },

    // Braces (diagonal)
    braces: {
        lengthsM: [2, 3, 4],
        weightKg: {
            2: 8.0,
            3: 10.5,
            4: 13.0
        }
    },

    // Platforms (steel decks)
    platforms: {
        lengthsM: [2.4, 1.8, 1.2],
        weightKg: {
            2.4: 18,
            1.8: 14,
            1.2: 10
        }
    },

    // Guardrails
    guardrails: {
        weightKg: 4.5
    },

    // Toe boards
    toeboards: {
        weightKg: 3.0
    },

    // Ladders
    ladders: {
        weightKg: 12.0
    }
};
