import { Property, ReturnType, SystemProperty } from "./WidgetXml";
import { capitalizeFirstLetter, commasAnd, extractProperties } from "./helpers";

export function generateClientTypes(
    widgetName: string,
    properties: Property[],
    systemProperties: SystemProperty[],
    isNative: boolean
): string[] {
    function resolveProp(key: string) {
        return properties.find(p => p.$.key === key);
    }

    const isLabeled = systemProperties.some(p => p.$.key === "Label");
    const results = Array.of<string>();
    results.push(
        isNative
            ? `export interface ${widgetName}Props<Style> {
    name: string;
    style: Style[];
${generateClientTypeBody(properties, true, results, resolveProp)}
}`
            : `export interface ${widgetName}ContainerProps {
    name: string;${
        !isLabeled
            ? `
    class: string;
    style?: CSSProperties;`
            : ""
    }
    tabIndex?: number;${
        isLabeled
            ? `
    id: string;`
            : ""
    }
${generateClientTypeBody(properties, false, results, resolveProp)}
}`
    );
    return results;
}

function actionIsLinkedInAnAttribute(propertyPath: string, properties: Property[]): boolean {
    return properties.some(prop => {
        if (prop.$.type === "attribute" && prop.$.onChange === propertyPath) {
            return true;
        }
        if (prop.$.type === "object" && prop.properties && prop.properties.length > 0) {
            return prop.properties.some(prop =>
                actionIsLinkedInAnAttribute(`../${propertyPath}`, extractProperties(prop))
            );
        }
        return false;
    });
}

function generateClientTypeBody(
    properties: Property[],
    isNative: boolean,
    generatedTypes: string[],
    resolveProp: (key: string) => Property | undefined
) {
    return properties
        .map(prop => {
            if (prop.$.type === "action" && actionIsLinkedInAnAttribute(prop.$.key, properties)) {
                return undefined;
            }

            return `    ${prop.$.key}${isOptionalProp(prop, resolveProp) ? "?" : ""}: ${toClientPropType(
                prop,
                isNative,
                generatedTypes,
                resolveProp
            )};`;
        })
        .filter(Boolean)
        .join("\n");
}

function isOptionalProp(prop: Property, resolveProp: (key: string) => Property | undefined) {
    switch (prop.$.type) {
        case "string":
        case "object":
            return false;
        case "action":
            return true;
        case "selection":
            return (
                (prop.selectionTypes?.flatMap(t => t.selectionType.map(t => t.$.name)) ?? []).includes("None") ||
                hasOptionalDataSource(prop, resolveProp)
            );
        default:
            return prop.$.required === "false" || hasOptionalDataSource(prop, resolveProp);
    }
}

export function hasOptionalDataSource(prop: Property, resolveProp: (key: string) => Property | undefined) {
    return prop.$.dataSource && resolveProp(prop.$.dataSource)?.$.required === "false";
}

function toClientPropType(
    prop: Property,
    isNative: boolean,
    generatedTypes: string[],
    resolveProp: (key: string) => Property | undefined
) {
    switch (prop.$.type) {
        case "boolean":
            return "boolean";
        case "string":
            return "string";
        case "action":
            return prop.$.dataSource ? "ListActionValue" : "ActionValue";
        case "textTemplate":
            return prop.$.dataSource ? "ListExpressionValue<string>" : "DynamicValue<string>";
        case "integer":
            return "number";
        case "decimal":
            return "Big";
        case "icon":
            return isNative ? "DynamicValue<NativeIcon>" : "DynamicValue<WebIcon>";
        case "image":
            return isNative ? "DynamicValue<NativeImage>" : "DynamicValue<WebImage>";
        case "file":
            return "DynamicValue<FileValue>";
        case "datasource":
            return "ListValue";
        case "attribute": {
            if (!prop.attributeTypes?.length) {
                throw new Error("[XML] Attribute property requires attributeTypes element");
            }
            const types = prop.attributeTypes
                .flatMap(ats => ats.attributeType)
                .map(at => toAttributeClientType(at.$.name));
            const unionType = toUniqueUnionType(types);
            return prop.$.dataSource ? `ListAttributeValue<${unionType}>` : `EditableValue<${unionType}>`;
        }
        case "association": {
            if (!prop.associationTypes?.length) {
                throw new Error("[XML] Association property requires associationTypes element");
            }
            const types = prop.associationTypes
                .flatMap(ats => ats.associationType)
                .map(at => toAssociationOutputType(at.$.name, !!prop.$.dataSource));
            return toUniqueUnionType(types);
        }
        case "expression":
            if (!prop.returnType || prop.returnType.length === 0) {
                throw new Error("[XML] Expression property requires returnType element");
            }
            const type = toExpressionClientType(prop.returnType[0], resolveProp);
            return prop.$.dataSource ? `ListExpressionValue<${type}>` : `DynamicValue<${type}>`;
        case "enumeration":
            const typeName = capitalizeFirstLetter(prop.$.key) + "Enum";
            generatedTypes.push(generateEnum(typeName, prop));
            return typeName;
        case "object":
            if (!prop.properties?.length) {
                throw new Error("[XML] Object property requires properties element");
            }
            const childType = capitalizeFirstLetter(prop.$.key) + "Type";
            const childProperties = extractProperties(prop.properties[0]);

            const resolveChildProp = (key: string) =>
                key.startsWith("../") ? resolveProp(key.substring(3)) : childProperties.find(p => p.$.key === key);

            generatedTypes.push(
                `export interface ${childType} {
${generateClientTypeBody(childProperties, isNative, generatedTypes, resolveChildProp)}
}`
            );
            return prop.$.isList === "true" ? `${childType}[]` : childType;
        case "widgets":
            return prop.$.dataSource ? "ListWidgetValue" : "ReactNode";
        case "selection":
            if (!prop.selectionTypes?.length) {
                throw new Error("[XML] Selection property requires selectionTypes element");
            }

            const selectionTypes = prop.selectionTypes.flatMap(s => s.selectionType).map(s => s.$.name);
            const clientTypes = selectionTypes.filter(s => s !== "None").map(toSelectionClientType);
            return toUniqueUnionType(clientTypes);
        default:
            return "any";
    }
}

function generateEnum(typeName: string, prop: Property) {
    if (!prop.enumerationValues?.length || !prop.enumerationValues[0].enumerationValue?.length) {
        throw new Error("[XML] Enumeration property requires enumerations element");
    }
    const members = prop.enumerationValues[0].enumerationValue.map(type => `"${type.$.key}"`);
    return `export type ${typeName} = ${members.join(" | ")};`;
}

export function toAttributeClientType(xmlType: string): string {
    switch (xmlType) {
        case "Boolean":
            return "boolean";
        case "DateTime":
            return "Date";
        case "AutoNumber":
        case "Decimal":
        case "Integer":
        case "Long":
            return "Big";
        case "HashString":
        case "String":
        case "Enum":
            return "string";
        default:
            return "any";
    }
}

export function toExpressionClientType(
    returnTypeProp: ReturnType,
    resolveProp: (key: string) => Property | undefined
): string {
    const { type, assignableTo } = returnTypeProp.$ ?? {};

    if ((type && assignableTo) || (!type && !assignableTo)) {
        throw new Error(
            "[XML] Invalid return type for expression property: either type or assignableTo must be specified."
        );
    }

    if (type) {
        return toAttributeClientType(type);
    }

    const resolvedProperty = resolveProp(assignableTo!);
    if (!resolvedProperty) {
        throw new Error(
            `[XML] Invalid return type for expression property: invalid property path '${assignableTo}' in assignableTo attribute.`
        );
    }

    if (resolvedProperty.$.type !== "attribute") {
        throw new Error(
            `[XML] Invalid return type for expression property: assignableTo property '${assignableTo}' must be of type Attribute.`
        );
    }

    const { attributeTypes } = resolvedProperty;
    if (!attributeTypes?.[0]?.attributeType) {
        throw new Error(
            `[XML] Invalid return type for expression property: assignableTo property '${assignableTo}' must have attribute types.`
        );
    }

    const allowedTypes = ["Boolean", "DateTime", "Enum", "Integer", "Long", "String", "Decimal"];
    const types = attributeTypes
        .map(ats => ats.attributeType)
        .reduce((a, i) => a.concat(i), [])
        .map(at => at.$.name);

    const unsupportedTypes = types.filter(t => !allowedTypes.includes(t));
    if (unsupportedTypes.length !== 0) {
        throw new Error(
            `[XML] Invalid return type for expression property: assignableTo property '${assignableTo}' has unsupported attribute type ${commasAnd(
                unsupportedTypes
            )}.`
        );
    }

    return toUniqueUnionType(types.map(toAttributeClientType));
}

export function toAssociationOutputType(xmlType: string, linkedToDataSource: boolean) {
    switch (xmlType) {
        case "Reference":
            return linkedToDataSource ? "ListReferenceValue" : "ReferenceValue";
        case "ReferenceSet":
            return linkedToDataSource ? "ListReferenceSetValue" : "ReferenceSetValue";
        default:
            return "any";
    }
}

function toSelectionClientType(xmlType: string) {
    switch (xmlType) {
        case "Single":
            return "SelectionSingleValue";
        case "Multi":
            return "SelectionMultiValue";
        default:
            return "any";
    }
}

export function toUniqueUnionType(types: string[]) {
    return types.length ? Array.from(new Set(types)).join(" | ") : "any";
}
