const base = require("@mendix/pluggable-widgets-tools/test-config/jest.enzyme-free.config.js");

module.exports = {
    ...base,
    moduleNameMapper: {
        ...base.moduleNameMapper
    }
};
