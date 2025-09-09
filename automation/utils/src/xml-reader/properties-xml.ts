import { z } from "zod";
import { xmlTextToXmlJson } from "./parser";
import { readFile } from "node:fs/promises";

// Enums from XSD
const PropertyTypeEnum = z.enum([
    "action",
    "association",
    "attribute",
    "boolean",
    "datasource",
    "decimal",
    "entity",
    "entityConstraint",
    "enumeration",
    "expression",
    "file",
    "form",
    "icon",
    "image",
    "integer",
    "microflow",
    "nanoflow",
    "object",
    "selection",
    "string",
    "translatableString",
    "textTemplate",
    "widgets"
]);

const AttributeTypeEnum = z.enum([
    "AutoNumber",
    "Binary",
    "Boolean",
    "Currency",
    "DateTime",
    "Enum",
    "Float",
    "HashString",
    "Integer",
    "Long",
    "String",
    "Decimal"
]);

const AssociationTypeEnum = z.enum(["Reference", "ReferenceSet"]);

const SelectionTypeEnum = z.enum(["None", "Single", "Multi"]);

const ReturnTypeEnum = z.enum(["Void", "Boolean", "Integer", "Float", "DateTime", "String", "Object", "Decimal"]);

const VariableTypeEnum = z.enum(["Boolean", "Integer", "DateTime", "String", "Decimal"]);

const PlatformTypeEnum = z.enum(["All", "Native", "Web"]);

const SystemPropertyKeyEnum = z.enum(["Label", "Name", "TabIndex", "Editability", "Visibility"]);

const DefaultActionTypeEnum = z.enum([
    "None",
    "CallMicroflow",
    "CallNanoflow",
    "OpenPage",
    "Database",
    "Microflow",
    "Nanoflow",
    "Association"
]);

const IsPathTypeEnum = z.enum(["no", "optional", "yes"]);

const PathTypeEnum = z.enum(["reference", "referenceSet"]);

// Base schemas
const AttributeType = z.object({
    "@_name": AttributeTypeEnum
});

const AttributeTypes = z.object({
    attributeType: z.array(AttributeType)
});

const AssociationType = z.object({
    "@_name": AssociationTypeEnum
});

const AssociationTypes = z.object({
    associationType: z.array(AssociationType)
});

const SelectionType = z.object({
    "@_name": SelectionTypeEnum
});

const SelectionTypes = z.object({
    selectionType: z.array(SelectionType)
});

const EnumerationValue = z.object({
    "@_key": z.string(),
    "#text": z.string()
});

const EnumerationValues = z.object({
    enumerationValue: z.array(EnumerationValue)
});

const Translation = z.object({
    "@_lang": z.string(),
    "#text": z.string()
});

const Translations = z.object({
    translation: z.array(Translation)
});

const ActionVariable = z.object({
    "@_key": z.string(),
    "@_type": VariableTypeEnum,
    "@_caption": z.string()
});

const ActionVariables = z.object({
    actionVariable: z.array(ActionVariable)
});

const ReturnType = z.object({
    "@_type": ReturnTypeEnum.optional(),
    "@_isList": z.boolean().optional(),
    "@_entityProperty": z.string().optional(),
    "@_assignableTo": z.string().optional()
});

// Forward declaration for recursive properties structure
const BasePropertyGroup: z.ZodType<any> = z.lazy(() => PropertyGroup);

const Property = z.object({
    "@_key": z.string(),
    "@_type": PropertyTypeEnum,
    "@_isList": z.boolean().optional(),
    "@_entityProperty": z.string().optional(),
    "@_allowNonPersistableEntities": z.boolean().optional(),
    "@_isPath": IsPathTypeEnum.optional(),
    "@_pathType": PathTypeEnum.optional(),
    "@_parameterIsList": z.boolean().optional(),
    "@_multiline": z.boolean().optional().default(false),
    "@_defaultValue": z.string().optional(),
    "@_required": z.boolean().optional().default(true),
    "@_isDefault": z.boolean().optional(),
    "@_onChange": z.string().optional(),
    "@_dataSource": z.string().optional(),
    "@_selectableObjects": z.string().optional(),
    "@_setLabel": z.boolean().optional(),
    "@_isLinked": z.boolean().optional(),
    "@_isMetaData": z.boolean().optional(),
    "@_defaultType": DefaultActionTypeEnum.optional(),
    caption: z.string(),
    category: z.string().optional(),
    description: z.string(),
    attributeTypes: AttributeTypes.optional(),
    associationTypes: AssociationTypes.optional(),
    selectionTypes: SelectionTypes.optional(),
    enumerationValues: EnumerationValues.optional(),
    properties: z.lazy(() => Properties).optional(),
    returnType: ReturnType.optional(),
    translations: Translations.optional(),
    actionVariables: ActionVariables.optional()
});

const SystemProperty = z.object({
    "@_key": SystemPropertyKeyEnum,
    category: z.string().optional()
});

const PropertyGroup = z.object({
    "@_caption": z.string(),
    property: z.array(Property).optional(),
    systemProperty: z.array(SystemProperty).optional(),
    propertyGroup: z.array(BasePropertyGroup).optional()
});

const Properties = z.object({
    property: z.array(Property).optional(),
    systemProperty: z.array(SystemProperty).optional()
});

const PhoneGap = z.object({
    "@_enabled": z.boolean()
});

const PropertiesXMLFile = z.object({
    "?xml": z.object({
        "@_version": z.literal("1.0"),
        "@_encoding": z.literal("utf-8")
    }),
    widget: z.object({
        "@_id": z.string(),
        "@_needsEntityContext": z.boolean().optional(),
        "@_pluginWidget": z.boolean().optional(),
        "@_mobile": z.boolean().optional(),
        "@_supportedPlatform": PlatformTypeEnum.optional(),
        "@_offlineCapable": z.boolean().optional(),
        "@_xmlns": z.literal("http://www.mendix.com/widget/1.0/"),
        "@_xmlns:xsi": z.literal("http://www.w3.org/2001/XMLSchema-instance"),
        "@_xsi:schemaLocation": z.string().optional(),
        name: z.string(),
        description: z.string(),
        studioProCategory: z.string().optional(),
        studioCategory: z.string().optional(),
        helpUrl: z.string().optional(),
        icon: z.string().optional(), // base64Binary
        phonegap: PhoneGap.optional(),
        properties: z.union([z.object({ propertyGroup: z.array(PropertyGroup) }).optional(), z.literal("")])
    })
});

type PropertiesXMLFile = z.infer<typeof PropertiesXMLFile>;

export async function readPropertiesXml(filePath: string): Promise<PropertiesXMLFile> {
    return PropertiesXMLFile.passthrough().parse(xmlTextToXmlJson(await readFile(filePath, "utf-8")));
}
