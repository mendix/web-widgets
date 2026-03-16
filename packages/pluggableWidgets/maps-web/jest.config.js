module.exports = {
    ...require("@mendix/pluggable-widgets-tools/test-config/jest.config.js"),
    transformIgnorePatterns: ["node_modules/(?!(.*leaflet.*))"]
};
