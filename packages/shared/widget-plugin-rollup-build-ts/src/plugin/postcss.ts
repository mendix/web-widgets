import postcssImport from "postcss-import";
import postcssUrl from "postcss-url";
import postcssPlugin from "rollup-plugin-postcss";
import type { PostCSSPluginConf } from "rollup-plugin-postcss";

type PostCSSConfigSubset = Pick<PostCSSPluginConf, "extract" | "minimize"> & {
    sourcemap: PostCSSPluginConf["sourceMap"];
};

type Options = PostCSSConfigSubset & {
    assetsDirName: string;
    relativeAssetPrefix: string;
    assetsDirAbsolute: string;
    to: string;
};

export function widgetPostcss(options: Options) {
    return postcssPlugin({
        extensions: [".css", ".sass", ".scss"],
        extract: options.extract,
        inject: false,
        minimize: options.minimize,
        plugins: [
            postcssImport(),
            /**
             * We need two copies of postcss-url because of final styles bundling in studio (pro).
             * On line below, we just copying assets to widget bundle directory (com.mendix.widgets...)
             * To make it work, this plugin have few requirements:
             * 1. You should put your assets in src/assets/
             * 2. You should use relative path in your .scss files (e.g. url(../assets/icon.png)
             * 3. This plugin relies on `to` property of postcss plugin and it should be present, when
             * copying files to destination.
             */
            postcssUrl({
                url: "copy",
                assetsPath: options.assetsDirName
            }),
            /**
             * This instance of postcss-url is just for adjusting asset path.
             */
            postcssUrl({ url: createUrlTransform(options.assetsDirName, options.relativeAssetPrefix) })
        ],
        sourceMap: options.sourcemap,
        use: ["sass"],
        to: options.to
    });
}

export function widgetPreviewPostcss(options: PostCSSConfigSubset) {
    return postcssPlugin({
        extensions: [".css", ".sass", ".scss"],
        extract: false,
        inject: true,
        minimize: options.minimize,
        plugins: [postcssImport(), postcssUrl({ url: "inline" })],
        sourceMap: options.sourcemap,
        use: ["sass"]
    });
}

/**
 * This function is used by postcss-url.
 * Its main purpose to "adjust" asset path so that
 * after bundling css by studio assets paths stay correct.
 * Adjustment is required because of assets copying -- postcss-url can copy
 * files, but final url will be relative to *destination* file and though
 * will be broken after bundling by studio (pro).
 *
 * Example
 * before: assets/icon.png
 * after: com/mendix/widget/web/accordion/assets/icon.png
 */
export const createUrlTransform = (matchPrefix: string, relativeAssetPrefix: string) => (asset: { url: string }) => {
    console.log(asset);
    return asset.url.startsWith(`${matchPrefix}/`) ? `${relativeAssetPrefix}/${asset.url}` : asset.url;
};
