#!/usr/bin/env node
// Copies a widget MPK and wraps its ESM entry so every props object is recorded by probe/probe.mjs.
// Used only to observe a real Mendix app; the widget's own code is unchanged.
// Usage: node runtime/make-probe-mpk.mjs <in.mpk> <out.mpk> <widget module path inside the mpk>
//   e.g. com/mendix/widget/web/datagrid/Datagrid.mjs
/* global process, console, URL */
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const [input, output, entry] = process.argv.slice(2);
if (!input || !output || !entry) {
    console.error("Usage: make-probe-mpk.mjs <in.mpk> <out.mpk> <entry.mjs>");
    process.exit(1);
}

const work = mkdtempSync(join(tmpdir(), "probe-mpk-"));
try {
    execFileSync("python3", ["-m", "zipfile", "-e", resolve(input), work]);
    const entryPath = join(work, entry);
    const source = readFileSync(entryPath, "utf8");
    const exportLine = /^export \{ (\w+) as default \};$/m;
    const match = source.match(exportLine);
    if (!match) {
        throw new Error(`No "export { X as default };" line in ${entry}`);
    }
    const component = match[1];
    const wrapped =
        `import * as __probeBuilders from 'mendix/filters/builders';\n` +
        `import { recordProbe as __recordProbe } from './harness-probe.mjs';\n` +
        source.replace(
            exportLine,
            `function __Probed(props) { __recordProbe(props, __probeBuilders); return jsx(${component}, { ...props }); }\n` +
                `export { __Probed as default };`
        );
    if (!/import \{[^}]*\bjsx\b[^}]*\} from 'react\/jsx-runtime'/.test(wrapped)) {
        throw new Error(`${entry} does not import jsx from react/jsx-runtime`);
    }
    writeFileSync(entryPath, wrapped);
    copyFileSync(
        fileURLToPath(new URL("../probe/probe.mjs", import.meta.url)),
        join(dirname(entryPath), "harness-probe.mjs")
    );
    const out = resolve(output);
    rmSync(out, { force: true });
    execFileSync("python3", ["-m", "zipfile", "-c", out, ...readdirSync(work)], { cwd: work });
    console.log(`Wrote ${out} (${basename(entry)} wraps ${component})`);
} finally {
    rmSync(work, { recursive: true, force: true });
}
