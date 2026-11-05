import copyFiles from "@mendix/rollup-web-widgets/copyFiles.mjs";

/**
 * The Views under `@combobox-ui/*` live in the app's `node_modules`, not in the widget. The widget
 * bundle keeps their dynamic imports as they are; Studio Pro's bundler resolves them when it bundles
 * the app and turns each one into a chunk loaded on first use.
 */
const uiPackages = /^@combobox-ui\//;

export default args =>
    copyFiles(args).map(config => ({
        ...config,
        external: [...(Array.isArray(config.external) ? config.external : [config.external]), uiPackages]
    }));
