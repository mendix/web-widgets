import { Properties, hideNestedPropertiesIn, hidePropertiesIn } from "@mendix/pluggable-widgets-tools";
import {
    ContainerProps,
    StructurePreviewProps,
    structurePreviewPalette,
    container
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { SelectionControlsPreviewProps } from "../typings/SelectionControlsProps";

const DATABASE_SOURCE_CONFIG: Array<keyof SelectionControlsPreviewProps> = [
    "optionsSourceDatabaseCaptionAttribute",
    "optionsSourceDatabaseCaptionExpression",
    "optionsSourceDatabaseCaptionType",
    "optionsSourceDatabaseCustomContent",
    "optionsSourceDatabaseDataSource",
    "optionsSourceDatabaseValueAttribute",
    "optionsSourceDatabaseItemSelection",
    "databaseAttributeString",
    "onChangeDatabaseEvent"
];

const ASSOCIATION_SOURCE_CONFIG: Array<keyof SelectionControlsPreviewProps> = [
    "optionsSourceAssociationCaptionAttribute",
    "optionsSourceAssociationCaptionExpression",
    "optionsSourceAssociationCaptionType",
    "optionsSourceAssociationCustomContent",
    "optionsSourceAssociationDataSource",
    "attributeAssociation"
];

export function getProperties(
    values: SelectionControlsPreviewProps & { Editability?: unknown },
    defaultProperties: Properties
): Properties {
    // Basic property hiding logic - can be expanded later
    if (values.source !== "database") {
        hidePropertiesIn(defaultProperties, values, ["customEditability", "customEditabilityExpression"]);
    }

    if (values.source === "context") {
        hidePropertiesIn(defaultProperties, values, [
            "staticAttribute",
            "optionsSourceStaticDataSource",
            ...DATABASE_SOURCE_CONFIG
        ]);
        if (["enumeration", "boolean"].includes(values.optionsSourceType)) {
            hidePropertiesIn(defaultProperties, values, [...ASSOCIATION_SOURCE_CONFIG]);
            if (values.optionsSourceType === "boolean") {
                hidePropertiesIn(defaultProperties, values, ["attributeEnumeration"]);
            } else {
                hidePropertiesIn(defaultProperties, values, ["attributeBoolean"]);
            }
        } else if (values.optionsSourceType === "association") {
            hidePropertiesIn(defaultProperties, values, ["attributeEnumeration", "attributeBoolean"]);
            if (values.optionsSourceAssociationCaptionType === "attribute") {
                hidePropertiesIn(defaultProperties, values, ["optionsSourceAssociationCaptionExpression"]);
            } else {
                hidePropertiesIn(defaultProperties, values, ["optionsSourceAssociationCaptionAttribute"]);
            }

            if (values.optionsSourceAssociationDataSource === null) {
                hidePropertiesIn(defaultProperties, values, ["optionsSourceAssociationCaptionType"]);
            }

            if (values.optionsSourceCustomContentType === "no") {
                hidePropertiesIn(defaultProperties, values, ["optionsSourceAssociationCustomContent"]);
            }
        }
    } else if (values.source === "database") {
        hidePropertiesIn(defaultProperties, values, [
            "attributeEnumeration",
            "attributeBoolean",
            "optionsSourceType",
            "staticAttribute",
            "optionsSourceStaticDataSource",
            "onChangeEvent",
            ...ASSOCIATION_SOURCE_CONFIG
        ]);
        if (values.optionsSourceDatabaseDataSource === null) {
            hidePropertiesIn(defaultProperties, values, ["optionsSourceDatabaseCaptionType"]);
        }
        if (values.optionsSourceDatabaseCaptionType === "attribute") {
            hidePropertiesIn(defaultProperties, values, ["optionsSourceDatabaseCaptionExpression"]);
        } else {
            hidePropertiesIn(defaultProperties, values, ["optionsSourceDatabaseCaptionAttribute"]);
        }
        if (values.optionsSourceCustomContentType === "no") {
            hidePropertiesIn(defaultProperties, values, ["optionsSourceDatabaseCustomContent"]);
        }
        if (values.optionsSourceDatabaseItemSelection === "Multi") {
            hidePropertiesIn(defaultProperties, values, [
                "optionsSourceDatabaseValueAttribute",
                "databaseAttributeString"
            ]);
        }
        if (values.databaseAttributeString.length === 0) {
            hidePropertiesIn(defaultProperties, values, ["optionsSourceDatabaseValueAttribute"]);
            hidePropertiesIn(defaultProperties, values, ["Editability"]);
            if (values.customEditability !== "conditionally") {
                hidePropertiesIn(defaultProperties, values, ["customEditabilityExpression"]);
            }
        } else {
            hidePropertiesIn(defaultProperties, values, ["customEditability", "customEditabilityExpression"]);
        }
    } else if (values.source === "static") {
        hidePropertiesIn(defaultProperties, values, [
            "attributeEnumeration",
            "attributeBoolean",
            "optionsSourceType",
            ...ASSOCIATION_SOURCE_CONFIG,
            ...DATABASE_SOURCE_CONFIG
        ]);
    }

    if (values.optionsSourceCustomContentType === "no") {
        values.optionsSourceStaticDataSource.forEach((_, index) => {
            hideNestedPropertiesIn(defaultProperties, values, "optionsSourceStaticDataSource", index, [
                "staticDataSourceCustomContent"
            ]);
        });
    }

    return defaultProperties;
}

function getIconPreview(_isDarkMode: boolean): ContainerProps {
    return {
        type: "Container",
        children: [
            container({ padding: 1 })(),
            {
                type: "Text",
                content: "☑",
                fontSize: 16
            }
        ]
    };
}

export function getPreview(_values: SelectionControlsPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];

    return {
        type: "RowLayout",
        columnSize: "fixed",
        backgroundColor: palette.background.containerFill,
        children: [
            {
                type: "RowLayout",
                columnSize: "grow",
                children: [
                    getIconPreview(isDarkMode),
                    {
                        type: "Container",
                        padding: 4,
                        children: [
                            {
                                type: "Text",
                                content: "Selection Controls",
                                fontColor: palette.text.primary,
                                fontSize: 10
                            }
                        ]
                    }
                ]
            }
        ]
    };
}

export function getCustomCaption(values: SelectionControlsPreviewProps): string {
    if (values.source === "static" && values.optionsSourceStaticDataSource.length > 0) {
        return "Selection Controls (Static)";
    }
    if (values.source === "database") {
        return "Selection Controls (Database)";
    }
    return "Selection Controls";
}
