import { cpSync, existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { fileURLToPath } from "url";
import copyFiles from "@mendix/rollup-web-widgets/copyFiles.mjs";
import url from "@mendix/pluggable-widgets-tools/configs/rollup-plugin-assets.mjs";

// The maps widget package was wrongly named with an uppercase M in the past. We have to keep that
// casing, otherwise Studio Pro no longer recognizes updates of already deployed widgets.
const PACKAGE_DIR = "com/mendix/widget/custom";
const LOWERCASE_WIDGET_DIR = `${PACKAGE_DIR}/maps`;
const WIDGET_DIR = `${PACKAGE_DIR}/Maps`;

const OUT_DIR = fileURLToPath(new URL("dist/tmp/widgets/", import.meta.url));

/**
 * The Mendix client re-bundles our .js and .css, but copies the widget's `assets` folder to the
 * deployment root as-is, so runtime images live at `<app root>/dist/<widget dir>/assets/<file>`.
 */
const ASSETS_BASE_URL = `dist/${WIDGET_DIR}/assets/`;

/**
 * The shared config emits imported images as separate files and hardcodes their URL as
 * `widgets/<packagePath>/<widgetname>/assets/<hash>.png`. Both parts of that URL are wrong here:
 *
 * 1. `<widgetname>` is `widgetName.toLowerCase()`, so it points at `.../maps/...` while our bundle
 *    folder is `.../Maps/...` -- a 404 on case sensitive web servers.
 * 2. The client serves widget resources from `dist/`, not from `widgets/`. This fix only applicable for react runtime.
 *
 * The URL stays relative so that it resolves against the app's `<base href>`, keeping apps that are
 * deployed under a sub path working.
 */
function fixImportedAssetPaths(config) {
    const index = config.plugins.findIndex(plugin => plugin?.name === "url");

    if (index === -1) {
        throw new Error("maps-web: expected the shared rollup config to contain the 'url' plugin.");
    }

    config.plugins[index] = url({
        include: ["**/*.svg", "**/*.png", "**/*.jp(e)?g", "**/*.gif", "**/*.webp"],
        limit: 0,
        publicPath: ASSETS_BASE_URL,
        destDir: `${OUT_DIR}${WIDGET_DIR}/assets`
    });
}

/**
 * Assets referenced from CSS (leaflet's layers/marker images) are handled by postcss-url instead of
 * the plugin above, and suffer from the same lowercasing. Those URLs need no `dist/` prefix, because
 * the bundled stylesheet itself ends up in `dist/`, so only the casing has to be corrected.
 */
function fixCssAssetPaths(config) {
    config.plugins.push({
        name: "maps-fix-css-asset-paths",
        generateBundle(_options, bundle) {
            for (const file of Object.values(bundle)) {
                if (file.type === "asset" && file.fileName.endsWith(".css")) {
                    file.source = String(file.source).replaceAll(LOWERCASE_WIDGET_DIR, WIDGET_DIR);
                }
            }
        },
        writeBundle() {
            // postcss-url copies the files itself, relative to the (lowercased) `to` option. On a
            // case sensitive file system that is a directory of its own, so merge it back.
            const lowercasePath = `${OUT_DIR}${LOWERCASE_WIDGET_DIR}`;
            const correctPath = `${OUT_DIR}${WIDGET_DIR}`;

            if (!existsSync(lowercasePath) || statSync(lowercasePath).ino === statSync(correctPath).ino) {
                return;
            }

            cpSync(lowercasePath, correctPath, { recursive: true });
            rmSync(lowercasePath, { recursive: true, force: true });
        }
    });
}

export default args => {
    const result = copyFiles(args);

    const [jsConfig, mJsConfig] = result;

    const folderUrl = new URL(`dist/tmp/widgets/${WIDGET_DIR}/`, import.meta.url);

    // create target dir before any bundling to make sure casing is correct:
    // expected: com/mendix/widget/custom/Maps
    mkdirSync(fileURLToPath(folderUrl), { recursive: true });

    jsConfig.output.file = fileURLToPath(new URL("Maps.js", folderUrl));
    mJsConfig.output.file = fileURLToPath(new URL("Maps.mjs", folderUrl));

    fixImportedAssetPaths(jsConfig);
    fixImportedAssetPaths(mJsConfig);

    // Only the amd bundle extracts a stylesheet.
    fixCssAssetPaths(jsConfig);

    return result;
};
