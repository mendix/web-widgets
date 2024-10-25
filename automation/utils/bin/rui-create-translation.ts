#!/usr/bin/env ts-node-script
import { mkdir, writeFile } from "fs/promises";
import path from "node:path";
import { dirname } from "path";
import { getPackageFileContent, PackageSchema } from "../src";
import { readXml } from "../src/package-xml";
import { findCaptionsAndDescriptions, getWidgetXMLName, type Result } from "../src/widget-file-xml";
async function main(): Promise<void> {
    console.log(`Creating translation i18n format...`);
    const path = process.cwd();

    const raw = await getPackageFileContent(path);
    // To get better error output from zod use empty objects
    const target = {
        mxpackage: {},
        marketplace: {},
        repository: {},
        testProject: {},
        ...raw
    };

    // First, check common fields
    const info = PackageSchema.parse(target);

    switch (info.mxpackage.type) {
        case "widget": {
            createTranslation(path);
            break;
        }
        case "module": {
            // TODO: ?
            break;
        }
        case "jsactions": {
            // TODO: ?
            break;
        }
    }
}

export async function createTranslation(cwd: string) {
    const widgetXMLName = await getWidgetXMLName(cwd);
    if (widgetXMLName) {
        const obj = await readXml(path.join(cwd, "src", widgetXMLName));
        const res = findCaptionsAndDescriptions(obj);
        let fileName = "result";
        if (obj && typeof obj === "object" && obj["widget"] && obj["widget"]["@_id"]) {
            fileName = obj["widget"]["@_id"].toLowerCase();
        }
        writeResultToFile(res, `dist/locales/en-US/${fileName}.json`);
        writeResultToFile(res, `../../../dist/locales/en-US/${fileName}.json`);
    }
}

// Function to ensure a directory exists
async function ensureDirectoryExists(filePath: string): Promise<void> {
    const dir = dirname(filePath);
    await mkdir(dir, { recursive: true });
}

// Function to write JSON result to a file
async function writeResultToFile(result: Result, filename: string): Promise<void> {
    await ensureDirectoryExists(filename);
    const jsonContent = JSON.stringify(result, null, 2);
    await writeFile(filename, jsonContent, "utf-8");
    console.log(`JSON result has been written to ${filename}`);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
