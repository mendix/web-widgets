module.exports = {
    ...require("@mendix/pluggable-widgets-tools/test-config/jest.enzyme-free.config.js"),
    transformIgnorePatterns: ["node_modules/(?!(.*leaflet.*))"],
    setupFilesAfterEnv: ["../jest.setup.js"]
};
