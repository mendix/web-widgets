import { readFile } from "fs/promises";
import { join } from "path";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import type { PropertyDefinition } from "./types.js";
import type { FileChange } from "./diff-engine.js";

export interface PropertyChangeResult {
    success: boolean;
    changes: Omit<FileChange, "originalContent">[];
    summary: string;
    error?: string;
}

export class PropertyEngine {
    private xmlParser: XMLParser;
    private xmlBuilder: XMLBuilder;

    constructor() {
        this.xmlParser = new XMLParser({
            ignoreAttributes: false,
            parseTagValue: false,
            parseAttributeValue: false,
            trimValues: false
        });
        this.xmlBuilder = new XMLBuilder({
            ignoreAttributes: false,
            format: true,
            indentBy: "    ",
            suppressEmptyNode: true
        });
    }

    /**
     * Add a property to a widget with full integration
     */
    async addProperty(packagePath: string, property: PropertyDefinition): Promise<PropertyChangeResult> {
        const changes: Omit<FileChange, "originalContent">[] = [];

        try {
            // 1. Update widget XML manifest
            const xmlChange = await this.addPropertyToXml(packagePath, property);
            changes.push(xmlChange);

            // 2. Update TypeScript interface
            const tsChange = await this.addPropertyToTypeScript(packagePath, property);
            if (tsChange) changes.push(tsChange);

            // 3. Update editor configuration
            const editorChange = await this.addPropertyToEditorConfig(packagePath, property);
            if (editorChange) changes.push(editorChange);

            // 4. Update runtime component (if exists)
            const runtimeChange = await this.addPropertyToRuntime(packagePath, property);
            if (runtimeChange) changes.push(runtimeChange);

            return {
                success: true,
                changes,
                summary: `Added property '${property.key}' (${property.type}) to widget with ${changes.length} file changes`
            };
        } catch (error) {
            return {
                success: false,
                changes: [],
                summary: `Failed to add property '${property.key}'`,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * Rename a property across all files
     */
    async renameProperty(packagePath: string, oldKey: string, newKey: string): Promise<PropertyChangeResult> {
        const changes: Omit<FileChange, "originalContent">[] = [];

        try {
            // 1. Update widget XML
            const xmlChange = await this.renamePropertyInXml(packagePath, oldKey, newKey);
            changes.push(xmlChange);

            // 2. Update TypeScript interface
            const tsChange = await this.renamePropertyInTypeScript(packagePath, oldKey, newKey);
            if (tsChange) changes.push(tsChange);

            // 3. Update editor configuration
            const editorChange = await this.renamePropertyInEditorConfig(packagePath, oldKey, newKey);
            if (editorChange) changes.push(editorChange);

            // 4. Update runtime component
            const runtimeChange = await this.renamePropertyInRuntime(packagePath, oldKey, newKey);
            if (runtimeChange) changes.push(runtimeChange);

            return {
                success: true,
                changes,
                summary: `Renamed property '${oldKey}' to '${newKey}' across ${changes.length} files`
            };
        } catch (error) {
            return {
                success: false,
                changes: [],
                summary: `Failed to rename property '${oldKey}' to '${newKey}'`,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * Add property to widget XML manifest
     */
    private async addPropertyToXml(
        packagePath: string,
        property: PropertyDefinition
    ): Promise<Omit<FileChange, "originalContent">> {
        const xmlFiles = await this.findWidgetXmlFiles(packagePath);
        const xmlPath = xmlFiles[0]; // Take the first widget XML file

        if (!xmlPath) {
            throw new Error("No widget XML file found");
        }

        const originalContent = await readFile(xmlPath, "utf-8");
        const xmlData = this.xmlParser.parse(originalContent);

        // Navigate to properties section
        if (!xmlData.widget?.properties) {
            throw new Error("Widget XML does not have properties section");
        }

        // Find appropriate property group or create one
        let targetGroup = this.findOrCreatePropertyGroup(xmlData.widget.properties, property.category || "General");

        // Create property XML object
        const propertyObj = this.createPropertyXmlObject(property);

        // Add property to the group
        if (!targetGroup.property) {
            targetGroup.property = [];
        } else if (!Array.isArray(targetGroup.property)) {
            targetGroup.property = [targetGroup.property];
        }

        targetGroup.property.push(propertyObj);

        const newContent = this.xmlBuilder.build(xmlData);

        return {
            filePath: xmlPath,
            newContent,
            operation: "update",
            description: `Add ${property.type} property '${property.key}' to widget XML`
        };
    }

    /**
     * Add property to TypeScript interface
     */
    private async addPropertyToTypeScript(
        packagePath: string,
        property: PropertyDefinition
    ): Promise<Omit<FileChange, "originalContent"> | null> {
        const typingsPath = join(packagePath, "typings", `${this.getWidgetName(packagePath)}Props.d.ts`);

        try {
            const originalContent = await readFile(typingsPath, "utf-8");

            // Find the interface definition
            const interfaceRegex = /interface\s+\w+Props\s*\{([^}]+)\}/;
            const match = originalContent.match(interfaceRegex);

            if (!match) {
                return null; // No interface found
            }

            const tsType = this.mapPropertyTypeToTypeScript(property);
            const propertyLine = `    ${property.key}${property.required ? "" : "?"}: ${tsType};`;

            // Insert the property before the closing brace
            const interfaceContent = match[1];
            const newInterfaceContent = interfaceContent.trimEnd() + "\n" + propertyLine + "\n";

            const newContent = originalContent.replace(
                interfaceRegex,
                match[0].replace(interfaceContent, newInterfaceContent)
            );

            return {
                filePath: typingsPath,
                newContent,
                operation: "update",
                description: `Add property '${property.key}' to TypeScript interface`
            };
        } catch (error) {
            return null; // File doesn't exist or couldn't be read
        }
    }

    /**
     * Add property configuration to editor config
     */
    private async addPropertyToEditorConfig(
        packagePath: string,
        property: PropertyDefinition
    ): Promise<Omit<FileChange, "originalContent"> | null> {
        const editorConfigPath = await this.findEditorConfigFile(packagePath);

        if (!editorConfigPath) {
            return null;
        }

        try {
            const originalContent = await readFile(editorConfigPath, "utf-8");

            // Find properties function or object
            const propertiesRegex = /(function\s+properties\s*\([^)]*\)[^{]*\{|const\s+properties\s*=\s*\{)/;

            if (!propertiesRegex.test(originalContent)) {
                return null; // No properties configuration found
            }

            // Add property validation or visibility rules if needed
            let newContent = originalContent;

            // Add basic validation example for the property
            const validationComment = `    // Validation for ${property.key} property can be added here\n`;

            // Insert before the last return statement or closing brace
            const insertionPoint = originalContent.lastIndexOf("return") || originalContent.lastIndexOf("}");
            if (insertionPoint > -1) {
                newContent =
                    originalContent.slice(0, insertionPoint) +
                    validationComment +
                    originalContent.slice(insertionPoint);
            }

            return {
                filePath: editorConfigPath,
                newContent,
                operation: "update",
                description: `Add editor configuration for property '${property.key}'`
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Add property usage to runtime component
     */
    private async addPropertyToRuntime(
        packagePath: string,
        property: PropertyDefinition
    ): Promise<Omit<FileChange, "originalContent"> | null> {
        const runtimeFiles = await this.findRuntimeFiles(packagePath);
        const mainRuntime = runtimeFiles.find(f => f.endsWith(".tsx") && !f.includes("Preview"));

        if (!mainRuntime) {
            return null;
        }

        try {
            const originalContent = await readFile(mainRuntime, "utf-8");

            // Find the component function
            const componentRegex = /export\s+function\s+\w+\s*\([^)]*\)\s*\{/;
            const match = originalContent.match(componentRegex);

            if (!match) {
                return null;
            }

            // Add property destructuring
            const propsDestructuringRegex = /const\s*\{\s*([^}]+)\s*\}\s*=\s*props/;
            const propsMatch = originalContent.match(propsDestructuringRegex);

            let newContent = originalContent;

            if (propsMatch) {
                // Add to existing destructuring
                const existingProps = propsMatch[1];
                const newProps = existingProps.trim() + `, ${property.key}`;
                newContent = originalContent.replace(propsDestructuringRegex, `const { ${newProps} } = props`);
            } else {
                // Add new destructuring after the function declaration
                const insertionPoint = originalContent.indexOf("{", match.index! + match[0].length);
                if (insertionPoint > -1) {
                    const destructuring = `\n    const { ${property.key} } = props;\n`;
                    newContent =
                        originalContent.slice(0, insertionPoint + 1) +
                        destructuring +
                        originalContent.slice(insertionPoint + 1);
                }
            }

            return {
                filePath: mainRuntime,
                newContent,
                operation: "update",
                description: `Add property '${property.key}' usage to runtime component`
            };
        } catch (error) {
            return null;
        }
    }

    // Rename operations (similar structure but with find/replace logic)
    private async renamePropertyInXml(
        packagePath: string,
        oldKey: string,
        newKey: string
    ): Promise<Omit<FileChange, "originalContent">> {
        const xmlFiles = await this.findWidgetXmlFiles(packagePath);
        const xmlPath = xmlFiles[0];

        const originalContent = await readFile(xmlPath, "utf-8");
        const newContent = originalContent.replace(new RegExp(`key="${oldKey}"`, "g"), `key="${newKey}"`);

        return {
            filePath: xmlPath,
            newContent,
            operation: "update",
            description: `Rename property key from '${oldKey}' to '${newKey}' in XML`
        };
    }

    private async renamePropertyInTypeScript(
        packagePath: string,
        oldKey: string,
        newKey: string
    ): Promise<Omit<FileChange, "originalContent"> | null> {
        const typingsPath = join(packagePath, "typings", `${this.getWidgetName(packagePath)}Props.d.ts`);

        try {
            const originalContent = await readFile(typingsPath, "utf-8");
            const newContent = originalContent.replace(new RegExp(`\\b${oldKey}\\b`, "g"), newKey);

            return {
                filePath: typingsPath,
                newContent,
                operation: "update",
                description: `Rename property '${oldKey}' to '${newKey}' in TypeScript interface`
            };
        } catch {
            return null;
        }
    }

    private async renamePropertyInEditorConfig(
        packagePath: string,
        oldKey: string,
        newKey: string
    ): Promise<Omit<FileChange, "originalContent"> | null> {
        const editorConfigPath = await this.findEditorConfigFile(packagePath);
        if (!editorConfigPath) return null;

        try {
            const originalContent = await readFile(editorConfigPath, "utf-8");
            const newContent = originalContent.replace(new RegExp(`["'\`]${oldKey}["'\`]`, "g"), `"${newKey}"`);

            return {
                filePath: editorConfigPath,
                newContent,
                operation: "update",
                description: `Rename property '${oldKey}' to '${newKey}' in editor config`
            };
        } catch {
            return null;
        }
    }

    private async renamePropertyInRuntime(
        packagePath: string,
        oldKey: string,
        newKey: string
    ): Promise<Omit<FileChange, "originalContent"> | null> {
        const runtimeFiles = await this.findRuntimeFiles(packagePath);
        const mainRuntime = runtimeFiles.find(f => f.endsWith(".tsx") && !f.includes("Preview"));

        if (!mainRuntime) return null;

        try {
            const originalContent = await readFile(mainRuntime, "utf-8");
            const newContent = originalContent.replace(new RegExp(`\\b${oldKey}\\b`, "g"), newKey);

            return {
                filePath: mainRuntime,
                newContent,
                operation: "update",
                description: `Rename property '${oldKey}' to '${newKey}' in runtime component`
            };
        } catch {
            return null;
        }
    }

    // Helper methods
    private async findWidgetXmlFiles(packagePath: string): Promise<string[]> {
        const srcPath = join(packagePath, "src");
        const { readdir } = await import("fs/promises");

        try {
            const files = await readdir(srcPath);
            return files.filter(f => f.endsWith(".xml") && !f.includes("package")).map(f => join(srcPath, f));
        } catch {
            return [];
        }
    }

    private async findEditorConfigFile(packagePath: string): Promise<string | null> {
        const srcPath = join(packagePath, "src");
        const { readdir } = await import("fs/promises");

        try {
            const files = await readdir(srcPath);
            const configFile = files.find(f => f.includes("editorConfig"));
            return configFile ? join(srcPath, configFile) : null;
        } catch {
            return null;
        }
    }

    private async findRuntimeFiles(packagePath: string): Promise<string[]> {
        const srcPath = join(packagePath, "src");
        const { readdir } = await import("fs/promises");

        try {
            const files = await readdir(srcPath);
            return files.filter(f => f.endsWith(".tsx") || f.endsWith(".ts")).map(f => join(srcPath, f));
        } catch {
            return [];
        }
    }

    private getWidgetName(packagePath: string): string {
        const parts = packagePath.split("/");
        return parts[parts.length - 1].split("-")[0]; // e.g., "switch-web" -> "switch"
    }

    private findOrCreatePropertyGroup(properties: any, groupName: string): any {
        if (!properties.propertyGroup) {
            properties.propertyGroup = [];
        } else if (!Array.isArray(properties.propertyGroup)) {
            properties.propertyGroup = [properties.propertyGroup];
        }

        let group = properties.propertyGroup.find((g: any) => g["@_caption"] === groupName);

        if (!group) {
            group = { "@_caption": groupName, property: [] };
            properties.propertyGroup.push(group);
        }

        return group;
    }

    private createPropertyXmlObject(property: PropertyDefinition): any {
        const obj: any = {
            "@_key": property.key,
            "@_type": property.type,
            caption: property.caption,
            description: property.description
        };

        if (property.required !== undefined) {
            obj["@_required"] = property.required.toString();
        }

        if (property.defaultValue !== undefined) {
            obj["@_defaultValue"] = property.defaultValue.toString();
        }

        if (property.type === "enumeration" && property.enumValues) {
            obj.enumerationValues = {
                enumerationValue: property.enumValues.map(value => ({ "@_key": value }))
            };
        }

        if (property.type === "attribute" && property.attributeTypes) {
            obj.attributeTypes = {
                attributeType: property.attributeTypes.map(type => ({ "@_name": type }))
            };
        }

        return obj;
    }

    private mapPropertyTypeToTypeScript(property: PropertyDefinition): string {
        switch (property.type) {
            case "text":
                return "string";
            case "boolean":
                return "boolean";
            case "integer":
                return "number";
            case "enumeration":
                return property.enumValues ? property.enumValues.map(v => `"${v}"`).join(" | ") : "string";
            case "expression":
                return "DynamicValue<string>";
            case "action":
                return "ActionValue";
            case "attribute":
                return "EditableValue<string>";
            default:
                return "any";
        }
    }
}
