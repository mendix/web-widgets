const { join } = require("path");
const base = require("@mendix/pluggable-widgets-tools/test-config/jest.config");

module.exports = {
    ...base,
    moduleNameMapper: {
        ...base.moduleNameMapper
    }
};
