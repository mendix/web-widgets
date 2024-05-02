const { writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

const isEqualByNameOrId = (a, b) => a.name === b.name || a._id === b._id;

const includesSimilarObject = (arr, value) => arr.some(obj => isEqualByNameOrId(obj, value));

const toRef = obj => ({ _id: obj._id });

const escapeSingleQuotes = str => {
    str = str.replace(/'/g, "''");
    return str;
};

const removeUTF8 = str => {
    str = str.replace(/[\u{0080}-\u{FFFF}]/gu, "_");
    return str;
};

const writeSnapshot = (filename, json) => {
    const target = resolve(__dirname, "..", "snapshots", filename);

    writeFileSync(target, json);
};

module.exports = {
    isEqualByNameOrId,
    includesSimilarObject,
    toRef,
    escapeSingleQuotes,
    writeSnapshot,
    removeUTF8
};
