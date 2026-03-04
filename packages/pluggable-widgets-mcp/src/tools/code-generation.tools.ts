/**
 * Code Generation Tools for Mendix Pluggable Widgets.
 *
 * Provides the `generate-widget-code` tool that transforms widget descriptions
 * and property definitions into working XML and TSX code.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mkdir, readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { z } from "zod";
import { generateWidgetXml, validateWidgetDefinition } from "@/generators/xml-generator";
import { detectWidgetPattern, generateWidgetTsx, type WidgetPattern } from "@/generators/tsx-generator";
import type { PropertyDefinition, WidgetDefinition } from "@/generators/types";
import { validateFilePath } from "@/security";
import type { ToolResponse } from "@/tools/types";
import { createErrorResponse, createToolResponse } from "@/tools/utils/response";

// =============================================================================
// Schemas
// =============================================================================

/**
 * Schema for enumeration values.
 */
const enumValueSchema = z.object({
    key: z.string().min(1).describe("Unique identifier for this enum value"),
    caption: z.string().min(1).describe("Display caption shown in Studio Pro")
});

/**
 * Schema for property definitions.
 * Matches the PropertyDefinition type from generators/types.ts
 */
const propertyDefinitionSchema = z.object({
    key: z
        .string()
        .min(1)
        .regex(/^[a-z][a-zA-Z0-9]*$/, "Must be camelCase (e.g., 'myProperty')")
        .describe("Property key in camelCase"),
    type: z
        .enum([
            "string",
            "boolean",
            "integer",
            "decimal",
            "textTemplate",
            "expression",
            "action",
            "attribute",
            "datasource",
            "association",
            "selection",
            "enumeration",
            "icon",
            "image",
            "file",
            "widgets",
            "object"
        ])
        .describe("Mendix property type"),
    caption: z.string().min(1).describe("Display caption shown in Studio Pro"),
    description: z.string().optional().describe("Help text shown in Studio Pro"),
    required: z.boolean().optional().describe("Whether this property is required"),
    defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional().describe("Default value for this property"),
    enumValues: z.array(enumValueSchema).optional().describe("Allowed values for enumeration type"),
    attributeTypes: z
        .array(
            z.enum([
                "String",
                "Integer",
                "Long",
                "Decimal",
                "Boolean",
                "DateTime",
                "Enum",
                "HashString",
                "Binary",
                "AutoNumber"
            ])
        )
        .optional()
        .describe("Allowed attribute types for attribute property"),
    isList: z.boolean().optional().describe("Whether datasource returns a list"),
    dataSource: z.string().optional().describe("Reference to datasource property key (for widgets type)"),
    returnType: z
        .enum(["String", "Integer", "Decimal", "Boolean", "DateTime"])
        .optional()
        .describe("Return type for expression property")
});

/**
 * Schema for property group definitions.
 */
const propertyGroupSchema = z.object({
    caption: z.string().min(1).describe("Group caption displayed in Studio Pro"),
    properties: z.array(z.string().min(1)).min(1).describe("Property keys in this group")
});

/**
 * Schema for the generate-widget-code tool input.
 */
const generateWidgetCodeSchema = z.object({
    widgetPath: z.string().min(1).describe("Absolute path to the scaffolded widget directory"),
    description: z.string().min(1).describe("Description of what the widget should do"),
    properties: z
        .preprocess(v => {
            // MCP clients (e.g. Maia) sometimes send JSON arrays as a stringified string.
            // Parse it transparently so validation still runs on the actual array contents.
            if (typeof v === "string") {
                try {
                    return JSON.parse(v);
                } catch {
                    return v; // let Zod report the type error
                }
            }
            return v;
        }, z.array(propertyDefinitionSchema).optional())
        .describe("Array of property definitions. If not provided, returns suggestions."),
    widgetPattern: z
        .enum(["display", "button", "input", "container", "dataList"])
        .optional()
        .describe("Optional hint for TSX generation pattern"),
    systemProperties: z
        .array(z.enum(["Name", "TabIndex", "Visibility"]))
        .optional()
        .describe(
            'System properties to include. Defaults to ["Name", "TabIndex", "Visibility"]. Pass empty array to include none.'
        ),
    propertyGroups: z
        .array(propertyGroupSchema)
        .optional()
        .describe(
            "Optional property grouping. If not provided, non-action properties go in 'General' and action properties go in 'Events' automatically."
        )
});

type GenerateWidgetCodeInput = z.infer<typeof generateWidgetCodeSchema>;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Extracts widget name from the widget directory.
 * Reads from package.json widgetName (authoritative source), falls back to basename.
 */
async function extractWidgetName(widgetPath: string): Promise<string> {
    // Try reading from package.json (authoritative source)
    try {
        const pkgPath = join(widgetPath, "package.json");
        const pkgJson = JSON.parse(await readFile(pkgPath, "utf-8"));
        if (pkgJson.widgetName && /^[A-Z][a-zA-Z0-9]*$/.test(pkgJson.widgetName)) {
            return pkgJson.widgetName;
        }
    } catch {
        // Fall through to basename approach
    }
    // Fallback: derive from directory name
    const base = basename(widgetPath);
    return base.charAt(0).toUpperCase() + base.slice(1);
}

/**
 * Cleans up stale scaffold files that don't match the current widget name.
 * The generator creates files named after the widget (e.g., CounterTwo.xml, CounterTwo.tsx).
 * When generate-widget-code writes new files, old scaffold artifacts must be removed
 * to prevent build conflicts (wrong typings, duplicate XML definitions).
 */
async function cleanupScaffoldFiles(widgetPath: string, widgetName: string): Promise<void> {
    const srcDir = join(widgetPath, "src");
    const typingsDir = join(widgetPath, "typings");

    let srcFiles: string[];
    try {
        srcFiles = await readdir(srcDir);
    } catch {
        return; // src dir doesn't exist yet, nothing to clean
    }

    // 1. Remove old .xml files in src/ (except package.xml and the one we're about to write)
    for (const file of srcFiles) {
        if (file === "package.xml" || file === `${widgetName}.xml`) continue;
        if (file.endsWith(".xml")) {
            await unlink(join(srcDir, file));
            console.error(`[code-generation] Cleaned up stale file: src/${file}`);
        }
    }

    // 2. Remove old .tsx, .editorConfig.ts, .editorPreview.tsx that don't match our widget name
    for (const file of srcFiles) {
        // Only clean top-level src/ files, not files in subdirectories
        const isOldTsx =
            file.endsWith(".tsx") && file !== `${widgetName}.tsx` && file !== `${widgetName}.editorPreview.tsx`;
        const isOldEditorConfig = file.endsWith(".editorConfig.ts") && file !== `${widgetName}.editorConfig.ts`;
        const isOldEditorPreview = file.endsWith(".editorPreview.tsx") && file !== `${widgetName}.editorPreview.tsx`;
        if (isOldTsx || isOldEditorConfig || isOldEditorPreview) {
            await unlink(join(srcDir, file));
            console.error(`[code-generation] Cleaned up stale file: src/${file}`);
        }
    }

    // 3. Remove old .css/.scss files in src/ui/ that don't match
    const uiDir = join(srcDir, "ui");
    try {
        const uiFiles = await readdir(uiDir);
        for (const file of uiFiles) {
            if (
                (file.endsWith(".css") || file.endsWith(".scss")) &&
                file !== `${widgetName}.css` &&
                file !== `${widgetName}.scss`
            ) {
                await unlink(join(uiDir, file));
                console.error(`[code-generation] Cleaned up stale file: src/ui/${file}`);
            }
        }
    } catch {
        /* ui dir might not exist yet */
    }

    // 4. Clear old typings that don't match
    try {
        const typingsFiles = await readdir(typingsDir);
        for (const file of typingsFiles) {
            if (file.endsWith(".d.ts") && file !== `${widgetName}Props.d.ts`) {
                await unlink(join(typingsDir, file));
                console.error(`[code-generation] Cleaned up stale file: typings/${file}`);
            }
        }
    } catch {
        /* typings dir might not exist yet */
    }

    // 5. Regenerate package.xml with correct widget name + version
    const packageXmlPath = join(srcDir, "package.xml");
    const widgetNameLower = widgetName.toLowerCase();
    let version = "1.0.0";
    let packagePath = "mendix";
    try {
        const pkgJson = JSON.parse(await readFile(join(widgetPath, "package.json"), "utf-8"));
        if (pkgJson.version) version = pkgJson.version;
        if (pkgJson.packagePath) packagePath = pkgJson.packagePath;
    } catch {
        /* use default */
    }
    const filePath = `${packagePath.replace(/\./g, "/")}/${widgetNameLower}`;
    const packageXml = [
        '<?xml version="1.0" encoding="utf-8" ?>',
        '<package xmlns="http://www.mendix.com/package/1.0/">',
        `    <clientModule name="${widgetName}" version="${version}" xmlns="http://www.mendix.com/clientModule/1.0/">`,
        "        <widgetFiles>",
        `            <widgetFile path="${widgetName}.xml"/>`,
        "        </widgetFiles>",
        "        <files>",
        `            <file path="${filePath}"/>`,
        "        </files>",
        "    </clientModule>",
        "</package>"
    ].join("\n");
    await writeFile(packageXmlPath, packageXml, "utf-8");
    console.error(`[code-generation] Regenerated package.xml for ${widgetName}`);
}

/**
 * Generates property suggestions based on widget description.
 */
function generatePropertySuggestions(description: string): string {
    const descLower = description.toLowerCase();

    // Common patterns to suggest
    const suggestions: Array<{
        key: string;
        type: string;
        caption: string;
        purpose: string;
    }> = [];

    // Counter-like widgets
    if (descLower.includes("counter") || descLower.includes("count") || descLower.includes("increment")) {
        suggestions.push(
            {
                key: "value",
                type: "attribute",
                caption: "Value",
                purpose: "Current counter value (bind to Integer attribute)"
            },
            { key: "step", type: "integer", caption: "Step", purpose: "Amount to increment/decrement (default: 1)" },
            { key: "minValue", type: "integer", caption: "Minimum", purpose: "Lower bound (optional)" },
            { key: "maxValue", type: "integer", caption: "Maximum", purpose: "Upper bound (optional)" },
            { key: "onIncrement", type: "action", caption: "On Increment", purpose: "Action when value increases" },
            { key: "onDecrement", type: "action", caption: "On Decrement", purpose: "Action when value decreases" }
        );
    }

    // Display/badge-like widgets
    if (
        descLower.includes("display") ||
        descLower.includes("show") ||
        descLower.includes("badge") ||
        descLower.includes("label")
    ) {
        suggestions.push(
            { key: "value", type: "textTemplate", caption: "Value", purpose: "Text to display" },
            { key: "type", type: "enumeration", caption: "Style", purpose: "Visual style variant" },
            { key: "onClick", type: "action", caption: "On Click", purpose: "Action when clicked" }
        );
    }

    // Button-like widgets
    if (descLower.includes("button") || descLower.includes("click") || descLower.includes("trigger")) {
        suggestions.push(
            { key: "caption", type: "textTemplate", caption: "Caption", purpose: "Button text" },
            { key: "icon", type: "icon", caption: "Icon", purpose: "Button icon (optional)" },
            { key: "buttonStyle", type: "enumeration", caption: "Style", purpose: "Button appearance variant" },
            { key: "onClick", type: "action", caption: "On Click", purpose: "Action when clicked" }
        );
    }

    // Input-like widgets
    if (
        descLower.includes("input") ||
        descLower.includes("edit") ||
        descLower.includes("enter") ||
        descLower.includes("form")
    ) {
        suggestions.push(
            { key: "value", type: "attribute", caption: "Value", purpose: "Bound attribute for data entry" },
            { key: "placeholder", type: "textTemplate", caption: "Placeholder", purpose: "Hint text when empty" },
            { key: "onChange", type: "action", caption: "On Change", purpose: "Action when value changes" },
            { key: "onEnter", type: "action", caption: "On Enter", purpose: "Action when Enter key pressed" }
        );
    }

    // List-like widgets
    if (
        descLower.includes("list") ||
        descLower.includes("items") ||
        descLower.includes("collection") ||
        descLower.includes("data")
    ) {
        suggestions.push(
            { key: "dataSource", type: "datasource", caption: "Data Source", purpose: "Source of items to display" },
            { key: "content", type: "widgets", caption: "Content", purpose: "Template for each item" },
            { key: "emptyMessage", type: "textTemplate", caption: "Empty Message", purpose: "Text when no items" },
            { key: "onItemClick", type: "action", caption: "On Item Click", purpose: "Action when item clicked" }
        );
    }

    // Container-like widgets
    if (
        descLower.includes("container") ||
        descLower.includes("card") ||
        descLower.includes("panel") ||
        descLower.includes("section")
    ) {
        suggestions.push(
            { key: "content", type: "widgets", caption: "Content", purpose: "Child widgets" },
            { key: "header", type: "textTemplate", caption: "Header", purpose: "Container title" },
            { key: "collapsible", type: "boolean", caption: "Collapsible", purpose: "Allow expand/collapse" }
        );
    }

    // Default suggestions if nothing matched
    if (suggestions.length === 0) {
        suggestions.push(
            { key: "value", type: "textTemplate", caption: "Value", purpose: "Main display value" },
            { key: "onClick", type: "action", caption: "On Click", purpose: "Action when clicked" }
        );
    }

    // Detect pattern from suggestions
    let suggestedPattern: WidgetPattern = "display";
    const types = suggestions.map(s => s.type);
    if (types.includes("datasource") && types.includes("widgets")) {
        suggestedPattern = "dataList";
    } else if (types.includes("widgets")) {
        suggestedPattern = "container";
    } else if (types.includes("attribute")) {
        suggestedPattern = "input";
    } else if (suggestions.length <= 4 && types.includes("action")) {
        suggestedPattern = "button";
    }

    // Build markdown table
    const table = [
        "| Property | Type | Caption | Purpose |",
        "|----------|------|---------|---------|",
        ...suggestions.map(s => `| ${s.key} | ${s.type} | ${s.caption} | ${s.purpose} |`)
    ].join("\n");

    return `📋 Widget requirements analysis needed

Based on your description "${description}", suggested properties:

${table}

Suggested pattern: **${suggestedPattern}** (${getPatternDescription(suggestedPattern)})

Please call generate-widget-code again with the properties array to generate the widget code.

Example:
\`\`\`json
{
  "widgetPath": "<same path>",
  "description": "${description}",
  "properties": [
    { "key": "value", "type": "textTemplate", "caption": "Value" },
    { "key": "onClick", "type": "action", "caption": "On Click" }
  ]
}
\`\`\``;
}

/**
 * Returns a human-readable description of a widget pattern.
 */
function getPatternDescription(pattern: WidgetPattern): string {
    switch (pattern) {
        case "display":
            return "read-only data display";
        case "button":
            return "action trigger with click handler";
        case "input":
            return "data entry with attribute binding";
        case "container":
            return "holds child widgets";
        case "dataList":
            return "renders items from datasource";
        default:
            return "general purpose";
    }
}

/**
 * Detects a mismatch between the selected widget pattern and the provided properties.
 *
 * Returns a warning string when the pattern's key property types are absent,
 * or null when the properties satisfy the pattern's requirements.
 */
export function detectTemplateMismatch(pattern: WidgetPattern, properties: PropertyDefinition[]): string | null {
    const types = properties.map(p => p.type);

    switch (pattern) {
        case "button": {
            const warnings: string[] = [];
            if (!types.includes("action")) {
                warnings.push("button will be permanently disabled (no action property)");
            }
            if (!types.includes("textTemplate") && !types.includes("string")) {
                warnings.push("button will render empty text (no textTemplate or string property for caption)");
            }
            return warnings.length > 0 ? warnings.join("; ") : null;
        }
        case "input":
            if (!types.includes("attribute")) {
                return "no attribute property for data binding — input pattern needs an attribute to read/write values";
            }
            return null;
        case "display":
            if (!types.includes("textTemplate") && !types.includes("expression") && !types.includes("string")) {
                return "read-only display component with no dynamic text source — only primitive types found; customize the generated code or add a textTemplate/expression property";
            }
            return null;
        case "container":
            if (!types.includes("widgets")) {
                return "no child content slot — container pattern needs a widgets property for nested widget content";
            }
            return null;
        case "dataList": {
            const missing: string[] = [];
            if (!types.includes("datasource")) missing.push("datasource");
            if (!types.includes("widgets")) missing.push("widgets");
            if (missing.length > 0) {
                return `dataList pattern is missing required properties: ${missing.join(", ")}`;
            }
            return null;
        }
        default:
            return null;
    }
}

// =============================================================================
// Tool Handler
// =============================================================================

async function handleGenerateWidgetCode(args: GenerateWidgetCodeInput): Promise<ToolResponse> {
    const { widgetPath, description, properties, widgetPattern } = args;

    try {
        // Verify widget directory exists
        const pathStats = await stat(widgetPath);
        if (!pathStats.isDirectory()) {
            return createErrorResponse(`Widget path is not a directory: ${widgetPath}`);
        }

        // If no properties provided, return suggestions
        if (!properties || properties.length === 0) {
            console.error(`[code-generation] No properties provided, returning suggestions`);
            return createToolResponse(generatePropertySuggestions(description));
        }

        // Extract widget name from path
        const widgetName = await extractWidgetName(widgetPath);

        console.error(`[code-generation] Generating code for ${widgetName} with ${properties.length} properties`);

        // Build widget definition for XML generator
        const widgetDefinition: WidgetDefinition = {
            name: widgetName,
            description,
            properties: properties as PropertyDefinition[],
            systemProperties: args.systemProperties ?? ["Name", "TabIndex", "Visibility"],
            propertyGroups: args.propertyGroups
        };

        // Validate widget definition
        const validationErrors = validateWidgetDefinition(widgetDefinition);
        if (validationErrors.length > 0) {
            return createErrorResponse(
                [
                    "❌ Widget definition validation failed:",
                    "",
                    ...validationErrors.map(e => `  • ${e}`),
                    "",
                    "Please fix the above issues and try again."
                ].join("\n")
            );
        }

        // Clean up stale scaffold files before writing new ones
        await cleanupScaffoldFiles(widgetPath, widgetName);

        // Generate XML
        console.error(`[code-generation] Generating XML...`);
        const xmlResult = generateWidgetXml(widgetDefinition);
        if (!xmlResult.success || !xmlResult.xml) {
            return createErrorResponse(`XML generation failed: ${xmlResult.error}`);
        }

        // Detect or use provided pattern
        const pattern = widgetPattern ?? detectWidgetPattern(properties as PropertyDefinition[]);
        console.error(`[code-generation] Using pattern: ${pattern}`);

        // Generate TSX
        console.error(`[code-generation] Generating TSX...`);
        const tsxResult = generateWidgetTsx(widgetName, properties as PropertyDefinition[], pattern);
        if (!tsxResult.success || !tsxResult.mainComponent) {
            return createErrorResponse(`TSX generation failed: ${tsxResult.error}`);
        }

        // Prepare files to write
        const filesToWrite = [
            { path: `src/${widgetName}.xml`, content: xmlResult.xml },
            { path: `src/${widgetName}.tsx`, content: tsxResult.mainComponent },
            { path: `src/${widgetName}.editorPreview.tsx`, content: tsxResult.editorPreview! },
            { path: `src/ui/${widgetName}.scss`, content: `.widget-${widgetName.toLowerCase()} {\n}\n` },
            { path: `src/.widget-definition.json`, content: JSON.stringify(widgetDefinition, null, 2) }
        ];

        // Validate and write files
        const writtenFiles: string[] = [];
        for (const file of filesToWrite) {
            try {
                validateFilePath(widgetPath, file.path, true);
                const fullPath = join(widgetPath, file.path);

                // Ensure parent directory exists
                const parentDir = dirname(fullPath);
                await mkdir(parentDir, { recursive: true });

                // Write file
                await writeFile(fullPath, file.content, "utf-8");
                writtenFiles.push(file.path);
                console.error(`[code-generation] Wrote: ${fullPath}`);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                return createErrorResponse(`Failed to write ${file.path}: ${message}`);
            }
        }

        // Build success response
        const propSummary = properties.map(p => p.key).join(", ");
        const mismatch = detectTemplateMismatch(pattern, properties as PropertyDefinition[]);

        const lines = [
            `✅ Widget code generated successfully!`,
            "",
            `📁 Files written:`,
            `  • src/${widgetName}.xml - Widget definition with ${properties.length} properties (${propSummary})`,
            `  • src/${widgetName}.tsx - Component using ${pattern} pattern`,
            `  • src/ui/${widgetName}.scss - Empty SCSS placeholder`,
            `  • src/.widget-definition.json - Widget definition snapshot (used by update-widget-properties)`
        ];

        if (mismatch) {
            lines.push("", `⚠️ Template notice: ${mismatch}`);
            lines.push(
                "",
                `🔨 Next steps:`,
                `  1. Review and customize the generated code (use write-widget-file to update src/${widgetName}.tsx)`,
                `  2. Run build-widget to compile and validate`,
                `  3. Update src/${widgetName}.editorPreview.tsx for Studio Pro design mode preview`,
                `  4. Test in Mendix Studio Pro`
            );
        } else {
            lines.push(
                "",
                `🔨 Next steps:`,
                `  1. Run build-widget to compile and validate`,
                `  2. Review and customize generated code`,
                `  3. Update src/${widgetName}.editorPreview.tsx for Studio Pro design mode preview`,
                `  4. Test in Mendix Studio Pro`
            );
        }

        return createToolResponse(lines.join("\n"));
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[code-generation] Error: ${message}`);
        return createErrorResponse(`Widget code generation failed: ${message}`);
    }
}

// =============================================================================
// Tool Registration
// =============================================================================

const GENERATE_WIDGET_CODE_DESCRIPTION = `Generates XML properties and TSX component code for a Mendix pluggable widget.

**Usage:**

1. **With properties (generates code):**
   Provide widgetPath, description, and properties array to generate XML + TSX files.

2. **Without properties (gets suggestions):**
   Provide only widgetPath and description to receive suggested properties based on your description.

**Supported property types:**
- Basic: string, boolean, integer, decimal
- Dynamic: textTemplate, expression
- Interactive: action, attribute (for data binding)
- Complex: datasource, widgets (for containers/lists), enumeration

**Pattern detection:**
The tool automatically detects the appropriate widget pattern (display, button, input, container, dataList) based on property types, or you can specify it explicitly.

**Example - Counter widget:**
\`\`\`json
{
  "widgetPath": "/path/to/CounterWidget",
  "description": "A counter that increments and decrements",
  "properties": [
    { "key": "value", "type": "attribute", "caption": "Value", "attributeTypes": ["Integer"] },
    { "key": "onIncrement", "type": "action", "caption": "On Increment" }
  ]
}
\`\`\``;

/**
 * Registers code generation tools for creating widget XML and TSX.
 */
export function registerCodeGenerationTools(server: McpServer): void {
    server.registerTool(
        "generate-widget-code",
        {
            title: "Generate Widget Code",
            description: GENERATE_WIDGET_CODE_DESCRIPTION,
            inputSchema: generateWidgetCodeSchema
        },
        handleGenerateWidgetCode
    );

    console.error("[code-generation] Registered 1 tool");
}
