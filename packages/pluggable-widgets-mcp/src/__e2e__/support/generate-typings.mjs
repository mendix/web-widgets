/**
 * Generates a widget's typings/*Props.d.ts from its XML, the same way `pluggable-widgets-tools`
 * does during a build.
 *
 * Run as a child process with cwd set to the widget directory. That is not incidental: the tool
 * reads the widget's package.json from process.cwd() at import time, so importing it from inside the
 * test process picks up pluggable-widgets-mcp's own package.json and fails with "Widget does not
 * define widgetName".
 *
 * Usage: node generate-typings.mjs <widgetDir>
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const widgetDir = process.argv[2];
if (!widgetDir) {
    console.error("usage: node generate-typings.mjs <widgetDir>");
    process.exit(2);
}

const entry = pathToFileURL(
    join(widgetDir, "node_modules", "@mendix", "pluggable-widgets-tools", "dist", "typings-generator", "index.js")
).href;

const { transformPackage } = await import(entry);
const src = join(widgetDir, "src");
await transformPackage(readFileSync(join(src, "package.xml"), "utf-8"), src);
