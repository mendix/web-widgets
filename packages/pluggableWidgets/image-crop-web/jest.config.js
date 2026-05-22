const base = require("@mendix/pluggable-widgets-tools/test-config/jest.config.js");

module.exports = {
    ...base,
    setupFilesAfterEnv: [...(base.setupFilesAfterEnv ?? []), require("path").join(__dirname, "jest.setup.ts")]
};
