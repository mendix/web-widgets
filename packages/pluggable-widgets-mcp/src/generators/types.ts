/**
 * Type definitions for widget generation.
 * These types define the JSON schema that AI fills in,
 * which is then transformed into valid XML by the generator.
 */

/**
 * Mendix property types supported in widget XML.
 */
export type MendixPropertyType =
    | "string"
    | "boolean"
    | "integer"
    | "decimal"
    | "textTemplate"
    | "expression"
    | "action"
    | "attribute"
    | "datasource"
    | "association"
    | "entity"
    | "enumeration"
    | "icon"
    | "image"
    | "file"
    | "widgets"
    | "object";

/**
 * Attribute types for attribute properties.
 */
export type AttributeType =
    | "String"
    | "Integer"
    | "Long"
    | "Decimal"
    | "Boolean"
    | "DateTime"
    | "Enum"
    | "HashString"
    | "Binary"
    | "AutoNumber";

/**
 * Enumeration value for enumeration properties.
 */
export interface EnumValue {
    key: string;
    caption: string;
}

/**
 * Definition for a single widget property.
 * This is the JSON structure AI fills in.
 */
export interface PropertyDefinition {
    /** Property key (camelCase identifier) */
    key: string;

    /** Property type */
    type: MendixPropertyType;

    /** Display caption in Studio Pro */
    caption: string;

    /** Optional description shown in Studio Pro */
    description?: string;

    /** Whether the property is required */
    required?: boolean;

    /** Default value (for string, boolean, integer, decimal, enumeration) */
    defaultValue?: string | number | boolean;

    /** For enumeration type: list of allowed values */
    enumValues?: EnumValue[];

    /** For attribute type: allowed attribute types */
    attributeTypes?: AttributeType[];

    /** For datasource type: whether it returns a list */
    isList?: boolean;

    /** For widgets type: reference to datasource property key */
    dataSource?: string;

    /** For object type: nested properties */
    properties?: PropertyDefinition[];

    /** For expression type: return type */
    returnType?: "String" | "Integer" | "Decimal" | "Boolean" | "DateTime";
}

/**
 * System properties available in Mendix widgets.
 */
export type SystemProperty = "Name" | "TabIndex" | "Visibility";

/**
 * Property group for organizing properties in Studio Pro.
 */
export interface PropertyGroup {
    /** Group caption displayed in Studio Pro */
    caption: string;

    /** Property keys in this group */
    properties: string[];
}

/**
 * Complete widget definition.
 * This is the full JSON structure AI provides for widget generation.
 */
export interface WidgetDefinition {
    /** Widget name (PascalCase) */
    name: string;

    /** Widget description */
    description: string;

    /** Widget ID (e.g., "com.mendix.widget.custom.mywidget.MyWidget") */
    id?: string;

    /** Organization namespace */
    organization?: string;

    /** Studio Pro category */
    studioCategory?: string;

    /** Whether widget needs entity context */
    needsEntityContext?: boolean;

    /** Whether widget supports offline */
    offlineCapable?: boolean;

    /** Help URL */
    helpUrl?: string;

    /** Property definitions */
    properties: PropertyDefinition[];

    /** System properties to include */
    systemProperties?: SystemProperty[];

    /** Optional property grouping */
    propertyGroups?: PropertyGroup[];
}

/**
 * Result of XML generation.
 */
export interface GeneratorResult {
    /** Whether generation succeeded */
    success: boolean;

    /** Generated XML content (if success) */
    xml?: string;

    /** Error message (if failed) */
    error?: string;
}
