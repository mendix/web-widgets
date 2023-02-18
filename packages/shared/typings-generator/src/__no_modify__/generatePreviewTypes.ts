import { Property, SystemProperty } from "./WidgetXml";
import { capitalizeFirstLetter, extractProperties } from "./helpers";
import { hasOptionalDataSource, toUniqueUnionType } from "./generateClientTypes";

export function generatePreviewTypes(
    widgetName: string,
    properties: Property[],
    systemProperties: SystemProperty[]
): string[] {
    const results = Array.of<string>();
    const isLabeled = systemProperties.some(p => p.$.key === "Label");

    function resolveProp(key: string) {
        return properties.find(p => p.$.key === key);
    }

    results.push(`export interface ${widgetName}PreviewProps {${
        !isLabeled
            ? `
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;`
            : ""
    }
    readOnly: boolean;
${generatePreviewTypeBody(properties, results, resolveProp)}
}`);
    return results;
}

function generatePreviewTypeBody(
    properties: Property[],
    generatedTypes: string[],
    resolveProp: (key: string) => Property | undefined
) {
    return properties
        .map(prop => `    ${prop.$.key}: ${toPreviewPropType(prop, generatedTypes, resolveProp)};`)
        .join("\n");
}

function toPreviewPropType(
    prop: Property,
    generatedTypes: string[],
    resolveProp: (key: string) => Property | undefined
): string {
    switch (prop.$.type) {
        case "boolean":
            return "boolean";
        case "string":
            return "string";
        case "action":
            return "{} | null";
        case "textTemplate":
            return "string";
        case "integer":
        case "decimal":
            return "number | null";
        case "icon":
            return '{ type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; } | null';
        case "image":
            return '{ type: "static"; imageUrl: string; } | { type: "dynamic"; entity: string; } | null';
        case "file":
            return "string";
        case "datasource":
            // { type: string } is included here due to an incorrect API output before 9.2 (PAG-1400)
            return "{} | { type: string } | null";
        case "attribute":
        case "association":
        case "expression":
            return "string";
        case "enumeration":
            return capitalizeFirstLetter(prop.$.key) + "Enum";
        case "object":
            if (!prop.properties?.length) {
                throw new Error("[XML] Object property requires properties element");
            }
            const childType = capitalizeFirstLetter(prop.$.key) + "PreviewType";
            const childProperties = extractProperties(prop.properties[0]);

            const resolveChildProp = (key: string) =>
                key.startsWith("../") ? resolveProp(key.substring(3)) : childProperties.find(p => p.$.key === key);

            generatedTypes.push(
                `export interface ${childType} {
${generatePreviewTypeBody(childProperties, generatedTypes, resolveChildProp)}
}`
            );
            return prop.$.isList === "true" ? `${childType}[]` : childType;
        case "widgets":
            return "{ widgetCount: number; renderer: ComponentType<{ caption?: string }> }";
        case "selection":
            if (!prop.selectionTypes?.length) {
                throw new Error("[XML] Selection property requires selectionTypes element");
            }

            const selectionTypes = prop.selectionTypes.flatMap(s => s.selectionType).map(s => s.$.name);
            if (hasOptionalDataSource(prop, resolveProp)) {
                selectionTypes.push("None");
            }
            return toUniqueUnionType(selectionTypes.map(s => `"${s}"`));
        default:
            return "any";
    }
}
