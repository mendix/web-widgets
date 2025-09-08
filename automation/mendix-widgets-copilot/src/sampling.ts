import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { XMLParser } from "fast-xml-parser";
import type { SampleMetadata, WidgetSampleContent } from "./types.js";
import { scanPackages, inspectWidget, resolveWidgetFiles } from "./helpers.js";

/**
 * Generate list of available widget samples
 */
export async function generateWidgetSamples(packagesDir: string): Promise<SampleMetadata[]> {
    const samples: SampleMetadata[] = [];
    const packages = await scanPackages(packagesDir);

    // Add repository-wide sample
    samples.push({
        uri: "mendix-widget://repository/list",
        name: "Widget Repository Overview",
        description: "List of all widgets in the repository with metadata",
        mimeType: "application/json"
    });

    // Add samples for each widget
    for (const pkg of packages) {
        if (pkg.kind === "pluggableWidget" || pkg.kind === "customWidget") {
            const widgetName = pkg.name.replace("@mendix/", "");

            // Overview sample
            samples.push({
                uri: `mendix-widget://${widgetName}/overview`,
                name: `${widgetName} - Complete Overview`,
                description: `Full context for ${widgetName} widget including manifest, types, and configuration`,
                mimeType: "application/json"
            });

            // Properties sample
            samples.push({
                uri: `mendix-widget://${widgetName}/properties`,
                name: `${widgetName} - Properties`,
                description: `Property definitions and structure for ${widgetName} widget`,
                mimeType: "application/json"
            });

            // Runtime sample
            samples.push({
                uri: `mendix-widget://${widgetName}/runtime`,
                name: `${widgetName} - Runtime Implementation`,
                description: `Runtime component implementation for ${widgetName} widget`,
                mimeType: "application/json"
            });
        }
    }

    return samples;
}

/**
 * Get complete widget overview sample
 */
export async function getWidgetOverviewSample(widgetPath: string, widgetName: string): Promise<WidgetSampleContent> {
    const inspection = await inspectWidget(widgetPath);
    const resolved = await resolveWidgetFiles(widgetPath);

    const sample: WidgetSampleContent = {
        widget: widgetName,
        type: "overview",
        timestamp: new Date().toISOString(),
        content: {
            metadata: {
                name: inspection.packageInfo.name,
                version: inspection.packageInfo.version,
                path: widgetPath,
                description: `Pluggable widget: ${widgetName}`
            }
        }
    };

    // Add widget XML manifest
    if (resolved.widgetXmlPath) {
        try {
            sample.content.manifest = await readFile(resolved.widgetXmlPath, "utf-8");
        } catch (err) {
            console.warn(`Could not read widget XML: ${err}`);
        }
    }

    // Add TypeScript definitions
    sample.content.typescript = {};

    // Try to find and read TypeScript props file
    const tsPropsPath = join(widgetPath, "typings", `${inspection.packageInfo.name.split("/").pop()}Props.d.ts`);
    try {
        sample.content.typescript.props = await readFile(tsPropsPath, "utf-8");
    } catch {
        // Try alternative location
        try {
            const altPath = join(widgetPath, "src", `${resolved.widgetName || widgetName}.tsx`);
            const mainComponent = await readFile(altPath, "utf-8");
            // Extract interface definitions from main component
            const interfaceMatch = mainComponent.match(/interface\s+\w+Props[^}]*\{[^}]*\}/gs);
            if (interfaceMatch) {
                sample.content.typescript.props = interfaceMatch.join("\n\n");
            }
        } catch {
            // No props found
        }
    }

    // Add configuration files
    sample.content.configuration = {};

    if (resolved.editorConfigPath) {
        try {
            sample.content.configuration.editorConfig = await readFile(resolved.editorConfigPath, "utf-8");
        } catch (err) {
            console.warn(`Could not read editor config: ${err}`);
        }
    }

    // Add package.json
    try {
        const packageJsonPath = join(widgetPath, "package.json");
        const packageJsonContent = await readFile(packageJsonPath, "utf-8");
        sample.content.configuration.packageJson = JSON.parse(packageJsonContent);
    } catch (err) {
        console.warn(`Could not read package.json: ${err}`);
    }

    return sample;
}

/**
 * Get widget properties sample
 */
export async function getWidgetPropertiesSample(widgetPath: string, widgetName: string): Promise<WidgetSampleContent> {
    const resolved = await resolveWidgetFiles(widgetPath);
    const parser = new XMLParser({
        ignoreAttributes: false,
        parseTagValue: false,
        parseAttributeValue: false
    });

    const sample: WidgetSampleContent = {
        widget: widgetName,
        type: "properties",
        timestamp: new Date().toISOString(),
        content: {
            properties: []
        }
    };

    // Parse widget XML to extract properties
    if (resolved.widgetXmlPath) {
        try {
            const xmlContent = await readFile(resolved.widgetXmlPath, "utf-8");
            const xmlData = parser.parse(xmlContent);

            // Extract properties from XML
            if (xmlData.widget?.properties?.propertyGroup) {
                const groups = Array.isArray(xmlData.widget.properties.propertyGroup)
                    ? xmlData.widget.properties.propertyGroup
                    : [xmlData.widget.properties.propertyGroup];

                for (const group of groups) {
                    if (group.property) {
                        const properties = Array.isArray(group.property) ? group.property : [group.property];

                        for (const prop of properties) {
                            sample.content.properties?.push({
                                key: prop["@_key"] || "",
                                type: prop["@_type"] || "",
                                caption: prop.caption || "",
                                description: prop.description || "",
                                required: prop["@_required"] === "true",
                                defaultValue: prop.defaultValue || undefined
                            });
                        }
                    }
                }
            }
        } catch (err) {
            console.warn(`Could not parse widget XML for properties: ${err}`);
        }
    }

    // Also include the raw XML for properties section
    if (resolved.widgetXmlPath) {
        try {
            const xmlContent = await readFile(resolved.widgetXmlPath, "utf-8");
            // Extract just the properties section
            const propsMatch = xmlContent.match(/<properties[^>]*>.*?<\/properties>/s);
            if (propsMatch) {
                sample.content.manifest = propsMatch[0];
            }
        } catch (err) {
            console.warn(`Could not extract properties XML: ${err}`);
        }
    }

    return sample;
}

/**
 * Get widget runtime implementation sample
 */
export async function getWidgetRuntimeSample(widgetPath: string, widgetName: string): Promise<WidgetSampleContent> {
    const resolved = await resolveWidgetFiles(widgetPath);

    const sample: WidgetSampleContent = {
        widget: widgetName,
        type: "runtime",
        timestamp: new Date().toISOString(),
        content: {
            runtime: {
                hooks: [],
                dependencies: []
            }
        }
    };

    // Find main component file
    const possibleMainFiles = [
        join(widgetPath, "src", `${resolved.widgetName || widgetName}.tsx`),
        join(widgetPath, "src", `${resolved.widgetName || widgetName}.ts`),
        join(widgetPath, "src", "index.tsx"),
        join(widgetPath, "src", "index.ts")
    ];

    for (const filePath of possibleMainFiles) {
        try {
            const content = await readFile(filePath, "utf-8");
            sample.content.runtime!.mainComponent = content;

            // Extract hooks used
            const hookMatches = content.match(/use[A-Z][a-zA-Z]+/g);
            if (hookMatches) {
                sample.content.runtime!.hooks = [...new Set(hookMatches)];
            }

            // Extract imports to identify dependencies
            const importMatches = content.match(/import .* from ["']([^"']+)["']/g);
            if (importMatches) {
                const deps = importMatches
                    .map(imp => {
                        const match = imp.match(/from ["']([^"']+)["']/);
                        return match ? match[1] : null;
                    })
                    .filter(dep => dep && !dep.startsWith(".") && !dep.startsWith("@mendix"))
                    .filter(Boolean) as string[];
                sample.content.runtime!.dependencies = [...new Set(deps)];
            }

            break; // Found main component, stop searching
        } catch {
            // File doesn't exist, try next
        }
    }

    // Include any component files from src/components
    try {
        const componentsPath = join(widgetPath, "src", "components");
        const componentFiles = await readdir(componentsPath);

        sample.content.typescript = sample.content.typescript || {};

        for (const file of componentFiles.slice(0, 3)) {
            // Limit to first 3 components
            if (file.endsWith(".tsx") || file.endsWith(".ts")) {
                try {
                    const content = await readFile(join(componentsPath, file), "utf-8");
                    if (!sample.content.typescript.component) {
                        sample.content.typescript.component = content;
                    }
                } catch {
                    // Ignore read errors
                }
            }
        }
    } catch {
        // No components directory
    }

    return sample;
}

/**
 * Parse URI and get corresponding sample
 */
export async function getSampleForUri(uri: string, repoRoot: string): Promise<WidgetSampleContent | { error: string }> {
    // Parse the URI: mendix-widget://{widget-name}/{sample-type}
    const uriMatch = uri.match(/^mendix-widget:\/\/([^/]+)\/(\w+)$/);

    if (!uriMatch) {
        return { error: `Invalid URI format: ${uri}` };
    }

    const [, widgetOrRepo, sampleType] = uriMatch;

    // Handle repository-wide samples
    if (widgetOrRepo === "repository" && sampleType === "list") {
        const packagesDir = join(repoRoot, "packages");
        const packages = await scanPackages(packagesDir);

        return {
            widget: "repository",
            type: "overview",
            timestamp: new Date().toISOString(),
            content: {
                metadata: {
                    name: "Mendix Web Widgets Repository",
                    version: "latest",
                    path: repoRoot,
                    description: "Complete list of widgets in the repository"
                },
                configuration: {
                    packageJson: packages
                }
            }
        };
    }

    // Find the widget path
    const packagesDir = join(repoRoot, "packages");
    const packages = await scanPackages(packagesDir);

    const widgetPackage = packages.find(
        pkg =>
            pkg.name === `@mendix/${widgetOrRepo}` || pkg.name === widgetOrRepo || pkg.path.endsWith(`/${widgetOrRepo}`)
    );

    if (!widgetPackage) {
        return { error: `Widget not found: ${widgetOrRepo}` };
    }

    // Generate the appropriate sample
    switch (sampleType) {
        case "overview":
            return await getWidgetOverviewSample(widgetPackage.path, widgetOrRepo);
        case "properties":
            return await getWidgetPropertiesSample(widgetPackage.path, widgetOrRepo);
        case "runtime":
            return await getWidgetRuntimeSample(widgetPackage.path, widgetOrRepo);
        default:
            return { error: `Unknown sample type: ${sampleType}` };
    }
}
