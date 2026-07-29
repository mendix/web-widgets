/**
 * The `set-widget-properties` tool: turns a property model into the widget's XML definition.
 *
 * That transformation is schema-constrained and mechanical, so the server owns it. The component
 * source is not — the client model writes the `.tsx` through `write-widget-file`, guided by the
 * `mendix://guidelines/widget-patterns` resource.
 *
 * The tool is **declarative**: callers send the properties the widget should have, not a diff. It
 * replaces an earlier pair of tools — one that generated and one that applied add/remove/modify
 * operations against a `.widget-definition.json` snapshot on disk. The snapshot existed only so the
 * diff had a base; with full state on every call it is unnecessary, and so is the class of bug where
 * the snapshot and the XML disagree.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { z } from "zod";
import type { PropertyDefinition, PropertyGroup, SystemProperty, WidgetDefinition } from "@/generators/types";
import { generateWidgetXml, validateWidgetDefinition } from "@/generators/xml-generator";
import { validateFilePath } from "@/security";
import {
    parseMaybeStringifiedArray,
    propertyDefinitionSchema,
    propertyGroupSchema,
    systemPropertySchema
} from "@/tools/property-schema";
import type { ToolResponse } from "@/tools/types";
import { createLogger } from "@/tools/utils/logger";
import { fail, ok } from "@/tools/utils/response";

const log = createLogger("widget-properties");

/** Studio Pro contributes these unless the caller says otherwise. */
const DEFAULT_SYSTEM_PROPERTIES: SystemProperty[] = ["Name", "TabIndex", "Visibility"];

const setWidgetPropertiesSchema = z.object({
    widgetPath: z.string().min(1).describe("Absolute path to the widget directory"),
    description: z.string().min(1).describe("Description of what the widget does"),
    properties: z
        .preprocess(parseMaybeStringifiedArray, z.array(propertyDefinitionSchema).min(1))
        .describe("The complete set of properties the widget should have. Replaces any existing set."),
    systemProperties: z
        .array(systemPropertySchema)
        .optional()
        .describe(
            `System properties to include. Defaults to [${DEFAULT_SYSTEM_PROPERTIES.join(", ")}]. Pass an empty array for none.`
        ),
    propertyGroups: z
        .array(propertyGroupSchema)
        .optional()
        .describe(
            "Optional grouping. When omitted, non-action properties go in 'General' and action properties in 'Events'."
        )
});

type SetWidgetPropertiesInput = z.infer<typeof setWidgetPropertiesSchema>;

/**
 * Resolves the widget's PascalCase name.
 *
 * `package.json`'s `widgetName` is authoritative — it is what the generator wrote and what the build
 * expects. The directory name is only a fallback, and a poor one: a folder called `my-widget` yields
 * `My-widget`, which fails PascalCase validation and blames the user for a name they never chose.
 */
async function resolveWidgetName(widgetPath: string): Promise<string> {
    try {
        const pkg = JSON.parse(await readFile(join(widgetPath, "package.json"), "utf-8")) as { widgetName?: string };
        if (pkg.widgetName && /^[A-Z][a-zA-Z0-9]*$/.test(pkg.widgetName)) {
            return pkg.widgetName;
        }
    } catch {
        // No package.json, or it is unreadable — fall through.
    }

    const folder = basename(widgetPath);
    return folder.charAt(0).toUpperCase() + folder.slice(1);
}

async function handleSetWidgetProperties(args: SetWidgetPropertiesInput): Promise<ToolResponse> {
    const { widgetPath, description, properties, systemProperties, propertyGroups } = args;

    try {
        const widgetName = await resolveWidgetName(widgetPath);

        const definition: WidgetDefinition = {
            name: widgetName,
            description,
            properties: properties as PropertyDefinition[],
            systemProperties: (systemProperties as SystemProperty[]) ?? DEFAULT_SYSTEM_PROPERTIES,
            propertyGroups: propertyGroups as PropertyGroup[] | undefined
        };

        const validationErrors = validateWidgetDefinition(definition);
        if (validationErrors.length > 0) {
            return fail(
                "ERR_INVALID_DEFINITION",
                ["Widget definition is invalid — nothing was written:", ...validationErrors.map(e => `  - ${e}`)].join(
                    "\n"
                )
            );
        }

        const result = generateWidgetXml(definition);
        if (!result.success || !result.xml) {
            return fail("ERR_INVALID_DEFINITION", `XML generation failed: ${result.error}`);
        }

        const relativePath = join("src", `${widgetName}.xml`);
        validateFilePath(widgetPath, relativePath, true);
        const fullPath = join(widgetPath, relativePath);
        await mkdir(dirname(fullPath), { recursive: true });
        await writeFile(fullPath, result.xml, "utf-8");
        log.info(`Wrote ${fullPath} (${properties.length} properties)`);

        return ok(
            [
                `Wrote ${relativePath} with ${properties.length} properties: ${properties.map(p => p.key).join(", ")}.`,
                "",
                "Next: write the component with write-widget-file, then run build-widget.",
                `  - src/${widgetName}.tsx (read mendix://guidelines/widget-patterns first)`,
                `  - src/${widgetName}.editorPreview.tsx for the Studio Pro design-mode preview`
            ].join("\n")
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log.error(message);
        return fail("ERR_FILE_WRITE", `Failed to set widget properties: ${message}`);
    }
}

const DESCRIPTION = `Writes a widget's XML definition from its property model.

Send the complete set of properties the widget should have; the file is rewritten to match. Returns
the path written. See the mendix://guidelines/property-types resource for the property schema.

Does not write the component — use write-widget-file for the .tsx.`;

export function registerWidgetPropertiesTools(server: McpServer): void {
    server.registerTool(
        "set-widget-properties",
        {
            title: "Set Widget Properties",
            description: DESCRIPTION,
            inputSchema: setWidgetPropertiesSchema
        },
        handleSetWidgetProperties
    );
}
