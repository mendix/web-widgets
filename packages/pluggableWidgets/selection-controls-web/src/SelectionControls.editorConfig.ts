import { Properties, hideNestedPropertiesIn, hidePropertiesIn } from "@mendix/pluggable-widgets-tools";
import {
    ContainerProps,
    StructurePreviewProps,
    structurePreviewPalette,
    dropzone,
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
    const structurePreviewChildren: StructurePreviewProps[] = [];
    let readOnly = _values.readOnly;

    // Handle custom content dropzones when enabled
    if (_values.optionsSourceCustomContentType !== "no") {
        if (_values.source === "context" && _values.optionsSourceType === "association") {
            structurePreviewChildren.push(
                dropzone(
                    dropzone.placeholder("Configure the selection controls: Place widgets here"),
                    dropzone.hideDataSourceHeaderIf(false)
                )(_values.optionsSourceAssociationCustomContent)
            );
        } else if (_values.source === "database") {
            structurePreviewChildren.push(
                dropzone(
                    dropzone.placeholder("Configure the selection controls: Place widgets here"),
                    dropzone.hideDataSourceHeaderIf(false)
                )(_values.optionsSourceDatabaseCustomContent)
            );
        } else if (_values.source === "static") {
            _values.optionsSourceStaticDataSource.forEach(value => {
                structurePreviewChildren.push(
                    container({
                        borders: true,
                        borderWidth: 1,
                        borderRadius: 2
                    })(
                        dropzone(
                            dropzone.placeholder(
                                `Configure the selection controls: Place widgets for option ${value.staticDataSourceCaption} here`
                            ),
                            dropzone.hideDataSourceHeaderIf(false)
                        )(value.staticDataSourceCustomContent)
                    )
                );
            });
        }
    }

    // Handle database-specific read-only logic
    if (_values.source === "database" && _values.databaseAttributeString.length === 0) {
        readOnly = _values.customEditability === "never";
    }

    // If no custom content dropzones, show default preview
    if (structurePreviewChildren.length === 0) {
        return {
            type: "RowLayout",
            columnSize: "fixed",
            backgroundColor: readOnly ? palette.background.containerDisabled : palette.background.containerFill,
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

    // Return container with dropzones
    return {
        type: "Container",
        children: [
            {
                type: "RowLayout",
                columnSize: "grow",
                borders: true,
                borderWidth: 1,
                borderRadius: 2,
                backgroundColor: readOnly ? palette.background.containerDisabled : palette.background.container,
                children: [
                    {
                        type: "Container",
                        grow: 1,
                        padding: 4,
                        children: structurePreviewChildren
                    },
                    readOnly && _values.readOnlyStyle === "text"
                        ? container({ grow: 0, padding: 4 })()
                        : {
                              ...getIconPreview(isDarkMode),
                              ...{ grow: 0, padding: 4 }
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
