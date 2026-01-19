/**
 * Code Generation Tools for Mendix Pluggable Widgets.
 *
 * Provides the `generate-widget-code` tool that transforms widget descriptions
 * and property definitions into working XML and TSX code.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mkdir, stat, writeFile } from "node:fs/promises";
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
            "entity",
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
 * Schema for the generate-widget-code tool input.
 */
const generateWidgetCodeSchema = z.object({
    widgetPath: z.string().min(1).describe("Absolute path to the scaffolded widget directory"),
    description: z.string().min(1).describe("Description of what the widget should do"),
    properties: z
        .array(propertyDefinitionSchema)
        .optional()
        .describe("Array of property definitions. If not provided, returns suggestions."),
    widgetPattern: z
        .enum(["display", "button", "input", "container", "dataList"])
        .optional()
        .describe("Optional hint for TSX generation pattern")
});

type GenerateWidgetCodeInput = z.infer<typeof generateWidgetCodeSchema>;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Extracts widget name from path (e.g., /path/to/MyWidget -> MyWidget)
 */
function extractWidgetName(widgetPath: string): string {
    const base = basename(widgetPath);
    // Convert to PascalCase if needed
    return base.charAt(0).toUpperCase() + base.slice(1);
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
        const widgetName = extractWidgetName(widgetPath);

        console.error(`[code-generation] Generating code for ${widgetName} with ${properties.length} properties`);

        // Build widget definition for XML generator
        const widgetDefinition: WidgetDefinition = {
            name: widgetName,
            description,
            properties: properties as PropertyDefinition[],
            systemProperties: ["Name", "TabIndex", "Visibility"]
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
            { path: `src/${widgetName}.tsx`, content: tsxResult.mainComponent }
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

        return createToolResponse(
            [
                `✅ Widget code generated successfully!`,
                "",
                `📁 Files modified:`,
                `  • src/${widgetName}.xml - Added ${properties.length} properties (${propSummary})`,
                `  • src/${widgetName}.tsx - Implemented using ${pattern} pattern`,
                "",
                `🔨 Next steps:`,
                `  1. Run build-widget to compile and validate`,
                `  2. Review generated code for customization`,
                `  3. Test in Mendix Studio Pro`
            ].join("\n")
        );
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
