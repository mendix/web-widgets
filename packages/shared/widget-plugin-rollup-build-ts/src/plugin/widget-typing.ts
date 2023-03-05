import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { transformPackage } from "@mendix/pluggable-widgets-tools/dist/typings-generator/index.js";
import type { Plugin } from "rollup";

type Params = {
    sourceDir: string;
};

export function widgetTyping({ sourceDir }: Params): Plugin {
    let firstRun = true;

    return {
        name: "widget-typing",
        async options(options) {
            // We have to run transformation before typescript starts its resolution cache =>
            // before the first buildStart starts, because buildStart is a "parallel" hook
            await runTransformation(sourceDir);
            return options;
        },
        async buildStart() {
            (await listDir(sourceDir))
                .filter(path => extname(path) === ".xml")
                .forEach(path => this.addWatchFile(path));

            if (!firstRun) {
                await runTransformation(sourceDir);
            }
            firstRun = false;
        }
    };
}

async function runTransformation(sourceDir: string) {
    await transformPackage(await readFile(join(sourceDir, "package.xml"), { encoding: "utf8" }), sourceDir);
}

async function listDir(path: string): Promise<string[]> {
    const entries = await readdir(path, { withFileTypes: true });
    return entries
        .filter(e => e.isFile())
        .map(e => join(path, e.name))
        .concat(...(await Promise.all(entries.filter(e => e.isDirectory()).map(e => listDir(join(path, e.name))))));
}
