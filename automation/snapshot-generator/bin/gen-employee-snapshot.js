const { EmployeeDB } = require("../lib/employee-db");
const { writeSnapshot } = require("../lib/utils");

const SNAPSHOT_SMALL = {
    country: 10,
    company: 20,
    role: 20,
    employee: 50
};

const SNAPSHOT_MEDIUM = {
    country: 20,
    company: 50,
    role: 100,
    employee: 200
};

const SNAPSHOT_LARGE = {
    country: 40,
    company: 100,
    role: 240,
    employee: 350
};

const SNAPSHOT_LARGE_5x5 = {
    country: 2,
    company: 5,
    role: 5,
    employee: 350
};

const SNAPSHOT_SAMPLE = {
    country: 1,
    company: 1,
    role: 1,
    employee: 1
};

const preset = {
    sample: [SNAPSHOT_SAMPLE, "sample"],
    small: [SNAPSHOT_SMALL, "small"],
    medium: [SNAPSHOT_MEDIUM, "medium"],
    large: [SNAPSHOT_LARGE, "large"],
    large_5x5: [SNAPSHOT_LARGE_5x5, "large_5x5"]
};

function main() {
    const presetName = process.argv[2];

    if (!presetName) {
        const usage = [
            "Usage: node gen-employee-snapshot.js <PRESET>",
            "",
            "PRESET - can be one of 'small', 'medium', 'large', 'sample', 'large_5x5'.",
            "",
            "sample    - single employee object, mainly for developer purposes and faster feedback.",
            "small     - small size snapshot. Good for debugging and faster startups.",
            "medium    - medium size snapshot for fine startup.",
            "large     - large data snapshot. Good for testing but slow project initialization.",
            "large_5x5 - generate large snapshot with only 5 roles and 5 companies."
        ];
        console.log(usage.join("\n"));
        return;
    }

    const [quantity, prefix] = preset[presetName];
    const snapshot = EmployeeDB.create(quantity);
    const filename = `employee-${prefix}-${snapshot.snapshot_id}.json`;

    console.log("Preset:", presetName, quantity);

    writeSnapshot(filename, EmployeeDB.toJSON(snapshot));

    console.log("Snapshot saved to", `snapshots/${filename}`);
}

main();
