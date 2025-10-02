#!/usr/bin/env ts-node

import { writeClientPackageXml, ClientPackageXML } from "../src/package-xml-v2";
import { getWidgetInfo } from "../src/package-info";
import { readPropertiesFile } from "../src/package-xml-v2/properties-xml";
import path from "node:path";
import { existsSync } from "node:fs";

async function generatePackageXml(): Promise<void> {
    const widgetDir = process.cwd();

    // Read package.json info
    const packageInfo = await getWidgetInfo(widgetDir);

    const srcDir = path.join(widgetDir, "src");

    // Create src directory if it doesn't exist
    if (!existsSync(srcDir)) {
        throw new Error(`Src folder not found: ${srcDir}`);
    }

    // Get properties file name from package.json (mxpackage.name + ".xml")
    const propertiesFileName = packageInfo.mxpackage.name + ".xml";
    const propertiesFilePath = path.join(srcDir, propertiesFileName);

    // Properties file must exist
    if (!existsSync(propertiesFilePath)) {
        throw new Error(`Properties file not found: ${propertiesFilePath}`);
    }

    // Read properties file and extract widget ID
    const propertiesXml = await readPropertiesFile(propertiesFilePath);
    const widgetId = propertiesXml.widget["@_id"];

    // Generate ClientPackageXML structure
    const clientPackageXml: ClientPackageXML = {
        name: packageInfo.mxpackage.name,
        version: packageInfo.version,
        widgetFiles: [packageInfo.mxpackage.name + ".xml"],
        files: [widgetId.split(".").slice(0, -1).join("/") + "/"]
    };

    // Write the generated package.xml
    const packageXmlPath = path.join(srcDir, "package.xml");
    await writeClientPackageXml(packageXmlPath, clientPackageXml);
}

async function main() {
    try {
        await generatePackageXml();
    } catch (error) {
        console.error("Error generating package.xml:", error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
