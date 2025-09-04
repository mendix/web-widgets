import { parse } from "path";
import { find } from "./shell";

export function findOssReadme(packageRoot: string, widgetName: string, version: string): string | undefined {
    const readmeossPattern = `*${widgetName}__${version}__READMEOSS_*.html`;

    console.info(`Looking for READMEOSS file matching pattern: ${readmeossPattern}`);

    // Find files matching the pattern in package root
    const matchingFiles = find(packageRoot).filter(file => {
        const fileName = parse(file).base;
        // Check if filename contains the widget name, version, and READMEOSS
        return fileName.includes(`${widgetName}__${version}__READMEOSS_`) && fileName.endsWith(".html");
    });

    return matchingFiles[0];
}
