const base = require("@mendix/pluggable-widgets-tools/test-config/jest.config.js");

module.exports = {
    ...base,
    transformIgnorePatterns: ["node_modules/(?!(.*(swiper|ssr-window|dom7).*))"]
};
