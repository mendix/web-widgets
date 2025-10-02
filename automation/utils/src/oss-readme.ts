import { globSync } from "glob";

export function findOssReadme(packageRoot: string, widgetName: string, version: string): string | undefined {
    const readmeossPattern = `**/*${widgetName}__${version}__READMEOSS_*.html`;

    console.info(`Looking for READMEOSS file matching pattern: ${readmeossPattern}`);

    // Use glob to find files matching the pattern in package root
    const matchingFiles = globSync(readmeossPattern, { cwd: packageRoot, absolute: true, ignore: "**/dist/**" });

    return matchingFiles[0];
}
