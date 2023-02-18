import { gray, green, yellow } from "colorette";
import { statSync } from "node:fs";
import { basename } from "node:path";
import prettyBytes from "pretty-bytes";
import type { Plugin } from "rollup";

function ppsize(size: number, warn: boolean) {
    const _250K = 250_000;
    const humanSize = prettyBytes(size);

    if (warn && size > _250K) {
        return `${yellow(humanSize)} - size limit exceed. This can impact web performance.`;
    }

    return green(humanSize);
}

type Options = {
    warnOnExceeded?: boolean;
};

export function bundleSize(pluginOptions?: Options): Plugin {
    return {
        name: "rollup-plugin-bundle-size",
        writeBundle(options) {
            if (options.file) {
                const stat = statSync(options.file);
                const name = basename(options.file);
                console.log(`${name}: ${gray("bundle size")}`, ppsize(stat.size, !!pluginOptions?.warnOnExceeded));
            }
        }
    };
}
