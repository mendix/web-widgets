/**
 * XML Generator for Mendix Widget Definitions.
 *
 * Transforms a WidgetDefinition JSON structure into valid Mendix widget XML.
 * This is a deterministic transformation - same input always produces same output.
 */

import type { EnumValue, GeneratorResult, PropertyDefinition, SystemProperty, WidgetDefinition } from "./types";

/**
 * Escapes special XML characters in text content.
 */
function escapeXml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * Generates XML for enumeration values.
 */
function generateEnumValues(values: EnumValue[], indent: string): string {
    const lines = values.map(
        v => `${indent}    <enumerationValue key="${escapeXml(v.key)}">${escapeXml(v.caption)}</enumerationValue>`
    );
    return `${indent}<enumerationValues>\n${lines.join("\n")}\n${indent}</enumerationValues>`;
}

/**
 * Generates XML for attribute types.
 */
function generateAttributeTypes(types: string[], indent: string): string {
    const lines = types.map(t => `${indent}    <attributeType name="${escapeXml(t)}" />`);
    return `${indent}<attributeTypes>\n${lines.join("\n")}\n${indent}</attributeTypes>`;
}

/**
 * Generates XML for a single property.
 */
function generateProperty(prop: PropertyDefinition, indent: string): string {
    const attrs: string[] = [`key="${escapeXml(prop.key)}"`, `type="${prop.type}"`];

    // Add optional attributes
    if (prop.required !== undefined) {
        attrs.push(`required="${prop.required}"`);
    }
    if (prop.defaultValue !== undefined) {
        attrs.push(`defaultValue="${escapeXml(String(prop.defaultValue))}"`);
    }
    if (prop.isList) {
        attrs.push(`isList="true"`);
    }
    if (prop.dataSource) {
        attrs.push(`dataSource="${escapeXml(prop.dataSource)}"`);
    }

    const attrString = attrs.join(" ");
    const innerIndent = indent + "    ";
    const lines: string[] = [];

    lines.push(`${indent}<property ${attrString}>`);
    lines.push(`${innerIndent}<caption>${escapeXml(prop.caption)}</caption>`);

    if (prop.description) {
        lines.push(`${innerIndent}<description>${escapeXml(prop.description)}</description>`);
    } else {
        lines.push(`${innerIndent}<description />`);
    }

    // Type-specific content
    if (prop.type === "enumeration" && prop.enumValues) {
        lines.push(generateEnumValues(prop.enumValues, innerIndent));
    }

    if (prop.type === "attribute" && prop.attributeTypes) {
        lines.push(generateAttributeTypes(prop.attributeTypes, innerIndent));
    }

    if (prop.type === "expression" && prop.returnType) {
        lines.push(`${innerIndent}<returnType type="${prop.returnType}" />`);
    }

    if (prop.type === "object" && prop.properties) {
        lines.push(`${innerIndent}<properties>`);
        lines.push(`${innerIndent}    <propertyGroup caption="Object list group">`);
        for (const nestedProp of prop.properties) {
            lines.push(generateProperty(nestedProp, innerIndent + "        "));
        }
        lines.push(`${innerIndent}    </propertyGroup>`);
        lines.push(`${innerIndent}</properties>`);
    }

    lines.push(`${indent}</property>`);

    return lines.join("\n");
}

/**
 * Generates XML for system properties.
 */
function generateSystemProperty(key: SystemProperty, indent: string): string {
    return `${indent}<systemProperty key="${key}" />`;
}

/**
 * Generates the complete widget XML from a widget definition.
 */
export function generateWidgetXml(widget: WidgetDefinition): GeneratorResult {
    try {
        // Derive defaults
        const organization = widget.organization ?? "mendix";
        const widgetNameLower = widget.name.toLowerCase();
        const widgetId = widget.id ?? `com.${organization}.widget.custom.${widgetNameLower}.${widget.name}`;
        const studioCategory = widget.studioCategory ?? "Display";
        const needsEntityContext = widget.needsEntityContext ?? false;
        const offlineCapable = widget.offlineCapable ?? true;

        // Build widget attributes
        const widgetAttrs = [
            `id="${escapeXml(widgetId)}"`,
            `pluginWidget="true"`,
            needsEntityContext ? `needsEntityContext="true"` : null,
            `offlineCapable="${offlineCapable}"`,
            `xmlns="http://www.mendix.com/widget/1.0/"`,
            `xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`,
            `xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../../../../node_modules/mendix/custom_widget.xsd"`
        ]
            .filter(Boolean)
            .join(" ");

        const lines: string[] = [];
        lines.push(`<?xml version="1.0" encoding="utf-8" ?>`);
        lines.push(`<widget ${widgetAttrs}>`);
        lines.push(`    <name>${escapeXml(widget.name)}</name>`);
        lines.push(`    <description>${widget.description ? escapeXml(widget.description) : ""}</description>`);
        lines.push(`    <studioProCategory>${escapeXml(studioCategory)}</studioProCategory>`);
        lines.push(`    <studioCategory>${escapeXml(studioCategory)}</studioCategory>`);

        if (widget.helpUrl) {
            lines.push(`    <helpUrl>${escapeXml(widget.helpUrl)}</helpUrl>`);
        }

        lines.push(`    <properties>`);
        lines.push(`        <propertyGroup caption="General">`);

        // Group properties if grouping is specified
        if (widget.propertyGroups && widget.propertyGroups.length > 0) {
            for (const group of widget.propertyGroups) {
                lines.push(`            <propertyGroup caption="${escapeXml(group.caption)}">`);
                for (const propKey of group.properties) {
                    const prop = widget.properties.find(p => p.key === propKey);
                    if (prop) {
                        lines.push(generateProperty(prop, "                "));
                    }
                }
                lines.push(`            </propertyGroup>`);
            }
        } else {
            // Default grouping: General for all properties
            lines.push(`            <propertyGroup caption="General">`);
            for (const prop of widget.properties.filter(p => p.type !== "action")) {
                lines.push(generateProperty(prop, "                "));
            }
            lines.push(`            </propertyGroup>`);

            // Events group for actions
            const actionProps = widget.properties.filter(p => p.type === "action");
            if (actionProps.length > 0) {
                lines.push(`            <propertyGroup caption="Events">`);
                for (const prop of actionProps) {
                    lines.push(generateProperty(prop, "                "));
                }
                lines.push(`            </propertyGroup>`);
            }
        }

        // System properties
        if (widget.systemProperties && widget.systemProperties.length > 0) {
            const visibilityProps = widget.systemProperties.filter(p => p === "Visibility");
            const commonProps = widget.systemProperties.filter(p => p !== "Visibility");

            if (visibilityProps.length > 0) {
                lines.push(`            <propertyGroup caption="Visibility">`);
                for (const sysProp of visibilityProps) {
                    lines.push(generateSystemProperty(sysProp, "                "));
                }
                lines.push(`            </propertyGroup>`);
            }

            if (commonProps.length > 0) {
                lines.push(`            <propertyGroup caption="Common">`);
                for (const sysProp of commonProps) {
                    lines.push(generateSystemProperty(sysProp, "                "));
                }
                lines.push(`            </propertyGroup>`);
            }
        }

        lines.push(`        </propertyGroup>`);
        lines.push(`    </properties>`);
        lines.push(`</widget>`);

        return {
            success: true,
            xml: lines.join("\n")
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Validates a widget definition before generation.
 * Returns an array of validation errors (empty if valid).
 */
export function validateWidgetDefinition(widget: WidgetDefinition): string[] {
    const errors: string[] = [];

    if (!widget.name || widget.name.trim() === "") {
        errors.push("Widget name is required");
    } else if (!/^[A-Z][a-zA-Z0-9]*$/.test(widget.name)) {
        errors.push("Widget name must be PascalCase (e.g., MyWidget)");
    }

    if (!widget.properties || widget.properties.length === 0) {
        errors.push("Widget must have at least one property");
    }

    for (const prop of widget.properties ?? []) {
        if (!prop.key || prop.key.trim() === "") {
            errors.push("Property key is required");
        } else if (!/^[a-z][a-zA-Z0-9]*$/.test(prop.key)) {
            errors.push(`Property key "${prop.key}" must be camelCase`);
        }

        if (!prop.caption || prop.caption.trim() === "") {
            errors.push(`Property "${prop.key}" must have a caption`);
        }

        if (prop.type === "enumeration" && (!prop.enumValues || prop.enumValues.length === 0)) {
            errors.push(`Enumeration property "${prop.key}" must have enumValues`);
        }

        if (prop.type === "attribute" && (!prop.attributeTypes || prop.attributeTypes.length === 0)) {
            errors.push(`Attribute property "${prop.key}" must have attributeTypes`);
        }
    }

    return errors;
}
