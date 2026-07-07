const base = require("@mendix/pluggable-widgets-tools/test-config/jest.config.js");

module.exports = {
    ...base,
    testEnvironment: "@happy-dom/jest-environment",
    moduleNameMapper: {
        ...base.moduleNameMapper,
        // Source uses baseUrl-relative imports (e.g. `from "src/controllers/..."`); map them to rootDir.
        "^src/(.*)$": "<rootDir>/$1"
    }
};
