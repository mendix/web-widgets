module.exports = {
    ...require("@mendix/pluggable-widgets-tools/test-config/jest.config"),
    /**
     * `quill` package is ESM module and because ESM is not supported by Jest yet
     * we mark `nanoevents` as a module that should be transformed by ts-jest.
     */
    transformIgnorePatterns: ["node_modules/(?!quill)/"]
};
