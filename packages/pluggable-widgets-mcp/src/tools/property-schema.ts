/**
 * The Zod schema for a Mendix widget property model — one definition, used by every tool that
 * accepts properties.
 *
 * This lives under `tools/` rather than `generators/` on purpose: `generators/` is the pure
 * JSON→XML transformation core and is deliberately Zod-free, operating on the plain
 * `PropertyDefinition` types in `generators/types.ts`. Validating untrusted input is a tool-boundary
 * concern, so it belongs here.
 *
 * Keep the enums below in step with `generators/types.ts`. They were previously written out three
 * times with no compile-time link, and had already drifted.
 */

import { z } from "zod";

/** Mendix property types, mirroring `MendixPropertyType`. */
export const PROPERTY_TYPES = [
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
] as const;

/** Attribute types an `attribute` property may accept, mirroring `AttributeType`. */
export const ATTRIBUTE_TYPES = [
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
] as const;

/** System properties Studio Pro can contribute, mirroring `SystemProperty`. */
export const SYSTEM_PROPERTIES = ["Name", "TabIndex", "Visibility"] as const;

export const enumValueSchema = z.object({
    key: z.string().min(1).describe("Unique identifier for this enum value"),
    caption: z.string().min(1).describe("Display caption shown in Studio Pro")
});

export const propertyDefinitionSchema = z.object({
    key: z
        .string()
        .min(1)
        .regex(/^[a-z][a-zA-Z0-9]*$/, "Must be camelCase (e.g., 'myProperty')")
        .describe("Property key in camelCase"),
    type: z.enum(PROPERTY_TYPES).describe("Mendix property type"),
    caption: z.string().min(1).describe("Display caption shown in Studio Pro"),
    description: z.string().optional().describe("Help text shown in Studio Pro"),
    required: z.boolean().optional().describe("Whether this property is required"),
    defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional().describe("Default value for this property"),
    enumValues: z.array(enumValueSchema).optional().describe("Allowed values for enumeration type"),
    attributeTypes: z
        .array(z.enum(ATTRIBUTE_TYPES))
        .optional()
        .describe("Allowed attribute types for an attribute property"),
    isList: z.boolean().optional().describe("Whether the datasource returns a list"),
    dataSource: z.string().optional().describe("Reference to a datasource property key (for widgets type)"),
    returnType: z
        .enum(["String", "Integer", "Decimal", "Boolean", "DateTime"])
        .optional()
        .describe("Return type for an expression property")
});

export const propertyGroupSchema = z.object({
    caption: z.string().min(1).describe("Group caption displayed in Studio Pro"),
    properties: z.array(z.string().min(1)).min(1).describe("Property keys in this group")
});

export const systemPropertySchema = z.enum(SYSTEM_PROPERTIES);

/**
 * Some MCP clients send JSON arrays as a stringified string. Parsing it here means validation still
 * runs against the real array contents rather than rejecting the whole argument.
 */
export function parseMaybeStringifiedArray(value: unknown): unknown {
    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch {
            return value; // let Zod report the type error
        }
    }
    return value;
}
