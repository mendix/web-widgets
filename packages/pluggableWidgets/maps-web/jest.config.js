const base = require("@mendix/pluggable-widgets-tools/test-config/jest.config");

module.exports = {
    ...base,
    transformIgnorePatterns: ["node_modules/(?!(.*leaflet.*))"]
};
