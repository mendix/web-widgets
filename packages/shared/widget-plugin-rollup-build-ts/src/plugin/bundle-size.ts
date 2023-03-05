import { gray, green, yellow } from "colorette";
import { statSync } from "node:fs";
import { basename } from "node:path";
import prettyBytes from "pretty-bytes";
import type { Plugin } from "rollup";

function ppsize(size: number, warn: boolean) {
    const LIMIT = 150_000;
    const humanSize = prettyBytes(size);

    if (warn && size > LIMIT) {
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
                console.log(gray(`${name}: bundle size`), ppsize(stat.size, !!pluginOptions?.warnOnExceeded));
            }
        }
    };
}
