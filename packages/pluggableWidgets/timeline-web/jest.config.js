const { join } = require("path");
const base = require("@mendix/pluggable-widgets-tools/test-config/jest.enzyme-free.config.js");

module.exports = {
    ...base,
    moduleNameMapper: {
        ...base.moduleNameMapper,
        "mendix/components/web/Icon": join(__dirname, "src/__mocks__/WebIcon")
    }
};
