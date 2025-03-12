import { writeFile } from "fs";
import { join } from "path";
import shelljs from "shelljs";
const { mkdir } = shelljs;
import mime from "mime-types";
import crypto from "crypto";
import postcssUrl from "postcss-url";
import { pathToFileURL } from "url";
import { postCssPlugin } from "@mendix/pluggable-widgets-tools/configs/rollup.config.mjs";

const processPath = path => {
    if (process.platform === "win32" && !process.env.JEST_WORKER_ID) {
        // on windows import("C:\\path\\to\\file") is not valid, so we need to
        // use file:// URLs
        return pathToFileURL(path).toString();
    } else {
        return path;
    }
};
const sourcePath = process.cwd();
const outDir = join(sourcePath, "/dist/tmp/widgets/");
const widgetPackageJson = (await import(processPath(join(sourcePath, "package.json")), { with: { type: "json" } }))
    .default;
const widgetName = widgetPackageJson.widgetName;
const widgetPackage = widgetPackageJson.packagePath;
const outWidgetDir = join(widgetPackage.replace(/\./g, "/"), widgetName.toLowerCase());
const absoluteOutPackageDir = join(outDir, outWidgetDir);
const assetsDirName = "assets";
const absoluteOutAssetsDir = join(absoluteOutPackageDir, assetsDirName);
const outAssetsDir = join(outWidgetDir, assetsDirName);

/**
 * Take inlined base64 assets and transform them into concrete files into the `assets` folder.
 */
function custom(asset) {
    const { url } = asset;
    if (url.startsWith("data:")) {
        const [, mimeType, data] = url.match(/data:([^;]*).*;base64,(.*)/);
        let extension = mime.extension(mimeType);
        // Only add extension if we mimeType has associated extension
        extension = extension ? `.${extension}` : "";
        const fileHash = crypto.createHash("md5").update(data).digest("hex");
        const filename = `${fileHash}${extension}`;
        const filePath = join(absoluteOutAssetsDir, filename);

        mkdir("-p", absoluteOutAssetsDir);

        writeFile(filePath, data, "base64", err => {
            if (err) {
                if (err.code === "EEXIST") {
                    return;
                }

                throw err;
            }
        });

        return `${outAssetsDir}/${filename}`;
    }

    return asset.url;
}

export default args => {
    const production = args.configProduction;
    const result = args.configDefaultConfig;
    const [jsConfig, mJsConfig] = result;

    [jsConfig, mJsConfig].forEach(config => {
        const postCssPluginIndex = config.plugins.findIndex(plugin => Boolean(plugin) && plugin.name === "postcss");
        if (postCssPluginIndex >= 0) {
            config.plugins[postCssPluginIndex] = postCssPlugin(config.output.format, production, [
                postcssUrl({ url: custom, assetsPath: absoluteOutPackageDir })
            ]);
        }
    });

    return result;
};
