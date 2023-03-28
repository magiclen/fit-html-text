const fs = require("fs");

// Generate src/location_letter.ts
{
    const LOCATION_LETTERS = {
        A: 10,
        B: 11,
        C: 12,
        D: 13,
        E: 14,
        F: 15,
        G: 16,
        H: 17,
        I: 34,
        J: 18,
        K: 19,
        L: 20,
        M: 21,
        N: 22,
        O: 35,
        P: 23,
        Q: 24,
        R: 25,
        S: 26,
        T: 27,
        U: 28,
        V: 29,
        W: 32,
        X: 30,
        Y: 31,
        Z: 33,
    };

    const items = [];

    for (const [l, v] of Object.entries(LOCATION_LETTERS)) {
        items.push(`${l}: ${Math.floor(v / 10) + (v % 10 * 9)}`);
    }

    const output = `export const LOCATION_VALUES: Readonly<Record<string, number>> = {\n    ${items.join(",\n    ")},\n};\n`;

    fs.writeFileSync("src/location_letters.ts", output);
}