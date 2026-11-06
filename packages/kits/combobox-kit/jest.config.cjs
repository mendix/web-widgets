const { join } = require("path");
const baseConfig = require("@mendix/pluggable-widgets-tools/test-config/jest.config.js");

module.exports = {
    ...baseConfig,
    setupFilesAfterEnv: [...baseConfig.setupFilesAfterEnv, join(__dirname, "jest.setup.ts")]
};
