import { XMLBuilder, XMLParser } from "fast-xml-parser";

const arrayNodes = [
    "file",
    "widgetFile",
    "propertyGroup",
    "enumerationValue",
    "property",
    "systemProperty",
    "attributeType",
    "translation",
    "selectionType",
    "actionVariable",
    "associationType"
];

const singleNodes = [
    "name",
    "caption",
    "description",
    "widget",
    "helpUrl",
    "enumerationValues",
    "returnType",
    "attributeTypes",
    "studioCategory",
    "studioProCategory",
    "selectionTypes",
    "category",
    "translations",
    "actionVariables",
    "associationTypes",
    "icon",
    "module",
    "projectFile",
    "properties"
];

export function xmlTextToXmlJson(xmlText: string | Buffer): unknown {
    const parser = new XMLParser({
        ignoreAttributes: false,
        allowBooleanAttributes: true,
        attributeValueProcessor: (attr, val) => {
            if (attr === "defaultValue") {
                return val;
            }
            if (val === "true") return true;
            if (val === "false") return false;
            return val;
        },
        isArray: (name, _jpath, _isLeafNode, isAttribute) => {
            if (isAttribute) return false;
            if (arrayNodes.includes(name)) return true;
            if (singleNodes.includes(name)) return false;

            return false;
        }
    });

    return parser.parse(xmlText);
}

export function xmlJsonToXmlText(xmlObject: any): string {
    const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true,
        indentBy: "    ",
        suppressEmptyNode: true
    });
    return builder
        .build(xmlObject)
        .replaceAll(/(<[^>]*?)\/>/g, "$1 />") // Add space before /> in self-closing tags
        .replaceAll(/(<\?[^>]*?)\?>/g, "$1 ?>"); // Add space before ?> in XML declarations
}
