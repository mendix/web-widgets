const base = require("@mendix/pluggable-widgets-tools/test-config/jest.config.js");
const { join } = require("path");

// Override the SVG transform: the base config returns a React component for *.svg imports,
// but we import SVGs as URL strings (declare module "*.svg" { const content: string }).
// Using assetsTransformer returns the filename as a plain string, matching the runtime behaviour
// and avoiding the React "Invalid value for prop `src`" warning in tests.
const assetsTransformer = join(
    require.resolve("@mendix/pluggable-widgets-tools/test-config/jest.config.js"),
    "../assetsTransformer.js"
);

module.exports = {
    ...base,
    transform: {
        ...base.transform,
        "^.+\\.svg$": assetsTransformer
    },
    setupFilesAfterEnv: [...(base.setupFilesAfterEnv ?? []), join(__dirname, "jest.setup.ts")]
};
