/**
 * Property Update Tool for Mendix Pluggable Widgets.
 *
 * Provides the `update-widget-properties` tool that incrementally modifies
 * widget property definitions without full regeneration.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { generateWidgetXml, validateWidgetDefinition } from "@/generators/xml-generator";
import type { PropertyDefinition, PropertyGroup, SystemProperty, WidgetDefinition } from "@/generators/types";
import { validateFilePath } from "@/security";
import type { ToolResponse } from "@/tools/types";
import { createErrorResponse, createToolResponse } from "@/tools/utils/response";

// =============================================================================
// Schemas
// =============================================================================

/**
 * Schema for a single property definition (reuse same structure as code-generation.tools.ts).
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
    enumValues: z
        .array(z.object({ key: z.string().min(1), caption: z.string().min(1) }))
        .optional()
        .describe("Allowed values for enumeration type"),
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

const operationSchema = z.discriminatedUnion("action", [
    z.object({
        action: z.literal("add"),
        property: propertyDefinitionSchema.describe("Property definition to add")
    }),
    z.object({
        action: z.literal("remove"),
        propertyKey: z.string().min(1).describe("Key of the property to remove")
    }),
    z.object({
        action: z.literal("modify"),
        propertyKey: z.string().min(1).describe("Key of the property to modify"),
        updates: z.record(z.string(), z.unknown()).describe("Fields to merge into the existing property definition")
    })
]);

const updateWidgetPropertiesSchema = z.object({
    widgetPath: z.string().min(1).describe("Absolute path to the widget directory"),
    operations: z
        .array(operationSchema)
        .min(1)
        .describe("List of operations to apply sequentially (add/remove/modify)"),
    systemProperties: z
        .array(z.enum(["Name", "TabIndex", "Visibility"]))
        .optional()
        .describe("Replaces current system properties if provided"),
    propertyGroups: z
        .array(
            z.object({
                caption: z.string().min(1).describe("Group caption"),
                properties: z.array(z.string().min(1)).min(1).describe("Property keys in this group")
            })
        )
        .optional()
        .describe("Replaces current property groups if provided")
});

type UpdateWidgetPropertiesInput = z.infer<typeof updateWidgetPropertiesSchema>;

// =============================================================================
// Tool Handler
// =============================================================================

async function handleUpdateWidgetProperties(args: UpdateWidgetPropertiesInput): Promise<ToolResponse> {
    const { widgetPath, operations, systemProperties, propertyGroups } = args;

    try {
        // Read the widget definition snapshot
        const snapshotPath = "src/.widget-definition.json";
        let widgetDefinition: WidgetDefinition;

        try {
            validateFilePath(widgetPath, snapshotPath);
            const fullSnapshotPath = join(widgetPath, snapshotPath);
            const raw = await readFile(fullSnapshotPath, "utf-8");
            widgetDefinition = JSON.parse(raw) as WidgetDefinition;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (message.includes("ENOENT") || message.includes("no such file")) {
                return createErrorResponse(
                    [
                        `❌ Widget definition snapshot not found at ${widgetPath}/src/.widget-definition.json`,
                        "",
                        "The snapshot is created by the generate-widget-code tool. Please run it first to generate the initial widget code.",
                        "",
                        "Example: call generate-widget-code with your widgetPath, description, and properties."
                    ].join("\n")
                );
            }
            return createErrorResponse(`Failed to read widget definition: ${message}`);
        }

        // Apply operations sequentially
        const changeLog: string[] = [];

        for (const op of operations) {
            if (op.action === "add") {
                const existing = widgetDefinition.properties.find(p => p.key === op.property.key);
                if (existing) {
                    return createErrorResponse(
                        `Cannot add property: key "${op.property.key}" already exists. Use action "modify" to update it.`
                    );
                }
                widgetDefinition.properties.push(op.property as PropertyDefinition);
                changeLog.push(`+ Added property "${op.property.key}" (${op.property.type})`);
            } else if (op.action === "remove") {
                const idx = widgetDefinition.properties.findIndex(p => p.key === op.propertyKey);
                if (idx === -1) {
                    return createErrorResponse(`Cannot remove property: key "${op.propertyKey}" not found.`);
                }
                widgetDefinition.properties.splice(idx, 1);
                changeLog.push(`- Removed property "${op.propertyKey}"`);
            } else if (op.action === "modify") {
                const prop = widgetDefinition.properties.find(p => p.key === op.propertyKey);
                if (!prop) {
                    return createErrorResponse(`Cannot modify property: key "${op.propertyKey}" not found.`);
                }
                Object.assign(prop, op.updates);
                changeLog.push(`~ Modified property "${op.propertyKey}": ${Object.keys(op.updates).join(", ")}`);
            }
        }

        // Replace systemProperties / propertyGroups if provided
        if (systemProperties !== undefined) {
            widgetDefinition.systemProperties = systemProperties as SystemProperty[];
            changeLog.push(`~ Updated systemProperties: [${systemProperties.join(", ")}]`);
        }

        if (propertyGroups !== undefined) {
            widgetDefinition.propertyGroups = propertyGroups as PropertyGroup[];
            changeLog.push(`~ Updated propertyGroups (${propertyGroups.length} groups)`);
        }

        // Validate updated definition
        const validationErrors = validateWidgetDefinition(widgetDefinition);
        if (validationErrors.length > 0) {
            return createErrorResponse(
                [
                    "❌ Updated widget definition is invalid:",
                    "",
                    ...validationErrors.map(e => `  • ${e}`),
                    "",
                    "Please fix the above issues. Operations were NOT saved."
                ].join("\n")
            );
        }

        // Regenerate XML
        const xmlResult = generateWidgetXml(widgetDefinition);
        if (!xmlResult.success || !xmlResult.xml) {
            return createErrorResponse(`XML regeneration failed: ${xmlResult.error}`);
        }

        // Write updated XML and snapshot
        const xmlPath = `src/${widgetDefinition.name}.xml`;
        const filesToWrite = [
            { path: xmlPath, content: xmlResult.xml },
            { path: snapshotPath, content: JSON.stringify(widgetDefinition, null, 2) }
        ];

        for (const file of filesToWrite) {
            try {
                validateFilePath(widgetPath, file.path, true);
                const fullPath = join(widgetPath, file.path);
                await writeFile(fullPath, file.content, "utf-8");
                console.error(`[property-update] Wrote: ${fullPath}`);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                return createErrorResponse(`Failed to write ${file.path}: ${message}`);
            }
        }

        return createToolResponse(
            [
                `✅ Widget properties updated successfully!`,
                "",
                `📝 Changes applied (${changeLog.length}):`,
                ...changeLog.map(c => `  ${c}`),
                "",
                `📁 Files updated:`,
                `  • ${xmlPath} - Regenerated with ${widgetDefinition.properties.length} properties`,
                `  • ${snapshotPath} - Snapshot updated`,
                "",
                `🔨 Next steps:`,
                `  1. Run build-widget to compile and validate`,
                `  2. Update src/${widgetDefinition.name}.tsx if new properties need to be wired up`
            ].join("\n")
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[property-update] Error: ${message}`);
        return createErrorResponse(`Widget property update failed: ${message}`);
    }
}

// =============================================================================
// Tool Registration
// =============================================================================

const UPDATE_WIDGET_PROPERTIES_DESCRIPTION = `Incrementally updates widget properties without full regeneration.

Reads the widget definition snapshot (src/.widget-definition.json created by generate-widget-code),
applies the specified operations, validates the result, and regenerates the XML.

**Operations:**
- \`add\`: Add a new property
- \`remove\`: Remove an existing property by key
- \`modify\`: Merge updates into an existing property

**Prerequisites:**
- Widget must have been generated with generate-widget-code first (creates the snapshot)

**Example — add a property and remove another:**
\`\`\`json
{
  "widgetPath": "/path/to/MyWidget",
  "operations": [
    { "action": "add", "property": { "key": "label", "type": "textTemplate", "caption": "Label" } },
    { "action": "remove", "propertyKey": "oldProp" }
  ]
}
\`\`\``;

/**
 * Registers the property update tool with the MCP server.
 */
export function registerPropertyUpdateTools(server: McpServer): void {
    server.registerTool(
        "update-widget-properties",
        {
            title: "Update Widget Properties",
            description: UPDATE_WIDGET_PROPERTIES_DESCRIPTION,
            inputSchema: updateWidgetPropertiesSchema
        },
        handleUpdateWidgetProperties
    );

    console.error("[property-update] Registered 1 tool");
}
