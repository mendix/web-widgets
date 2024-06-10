const { join, format } = require("node:path");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");

module.exports = function (args) {
    let [widgetAMD, widgetESM, ...editorEntries] = args.configDefaultConfig;
    const sharedDir = join(
        "dist",
        "tmp",
        "widgets",
        "com",
        "mendix",
        "es_modules",
        "plotly",
        "plotly.js"
    );
    const outESM = join(sharedDir);
    const external = widgetESM.external.slice();

    const coreBareSpecifier = "plotly.js/lib/core";
    const coreRelativeSpecifier =
        "../../../es_modules/plotly/plotly.js/lib/core.mjs";
    const plotlyCore = {
        external: external,
        input: coreBareSpecifier,
        plugins: [nodeResolve(), commonjs()],
        output: {
            format: "es",
            file: format({ dir: outESM, base: join("lib", "core.mjs") })
        }
    };

    widgetESM.external = [...external, coreBareSpecifier];
    widgetESM.output.paths = {
        [coreBareSpecifier]: coreRelativeSpecifier
    };

    return [plotlyCore, widgetESM, ...editorEntries];
};
