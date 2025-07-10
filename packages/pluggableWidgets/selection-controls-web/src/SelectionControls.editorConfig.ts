import { hideNestedPropertiesIn, hidePropertiesIn, Properties } from "@mendix/pluggable-widgets-tools";
import {
    ContainerProps,
    StructurePreviewProps,
    container,
    dropzone,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { SelectionControlsPreviewProps } from "../typings/SelectionControlsProps";
import IconSVG from "./assets/StructurePreviewIcon.svg";
import IconSVGDark from "./assets/StructurePreviewIconDark.svg";
// import { getDatasourcePlaceholderText } from "./helpers/utils";

// const LAZY_LOADING_CONFIG: Array<keyof SelectionControlsPreviewProps> = ["lazyLoading", "loadingType"];
const DATABASE_SOURCE_CONFIG: Array<keyof SelectionControlsPreviewProps> = [
    "optionsSourceDatabaseCaptionAttribute",
    "optionsSourceDatabaseCaptionExpression",
    "optionsSourceDatabaseCaptionType",
    "optionsSourceDatabaseCustomContent",
    "optionsSourceDatabaseCustomContentType",
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
    "optionsSourceAssociationCustomContentType",
    "optionsSourceAssociationDataSource",
    "attributeAssociation"
];

export function getProperties(
    values: SelectionControlsPreviewProps & { Editability?: unknown },
    defaultProperties: Properties
): Properties {
    if (values.source !== "database") {
        hidePropertiesIn(defaultProperties, values, ["customEditability", "customEditabilityExpression"]);
    }

    if (values.source === "context") {
        hidePropertiesIn(defaultProperties, values, [
            "staticAttribute",
            "staticDataSourceCustomContentType",
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

            if (values.optionsSourceAssociationCustomContentType === "no") {
                hidePropertiesIn(defaultProperties, values, ["optionsSourceAssociationCustomContent"]);
            }
        }
    } else if (values.source === "database") {
        hidePropertiesIn(defaultProperties, values, [
            "attributeEnumeration",
            "attributeBoolean",
            "optionsSourceType",
            "staticAttribute",
            "staticDataSourceCustomContentType",
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
        if (values.optionsSourceDatabaseCustomContentType === "no") {
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

    if (values.staticDataSourceCustomContentType === "no") {
        values.optionsSourceStaticDataSource.forEach((_, index) => {
            hideNestedPropertiesIn(defaultProperties, values, "optionsSourceStaticDataSource", index, [
                "staticDataSourceCustomContent"
            ]);
        });
    }

    return defaultProperties;
}

function getIconPreview(isDarkMode: boolean): ContainerProps {
    return {
        type: "Container",
        children: [
            container({ padding: 1 })(),
            {
                type: "Image",
                document: decodeURIComponent((isDarkMode ? IconSVGDark : IconSVG).replace("data:image/svg+xml,", "")),
                width: 41,
                height: 16
            }
        ]
    };
}

export function getPreview(_values: SelectionControlsPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    const structurePreviewChildren: StructurePreviewProps[] = [];
    // let dropdownPreviewChildren: StructurePreviewProps[] = [];
    let readOnly = _values.readOnly;
    if (
        _values.source === "context" &&
        _values.optionsSourceType === "association" &&
        _values.optionsSourceAssociationCustomContentType !== "no"
    ) {
        structurePreviewChildren.push(
            dropzone(
                dropzone.placeholder("Configure the combo box: Place widgets here"),
                dropzone.hideDataSourceHeaderIf(false)
            )(_values.optionsSourceAssociationCustomContent)
        );
    }
    if (_values.source === "database") {
        if (_values.optionsSourceDatabaseCustomContentType !== "no") {
            structurePreviewChildren.push(
                dropzone(
                    dropzone.placeholder("Configure the combo box: Place widgets here"),
                    dropzone.hideDataSourceHeaderIf(false)
                )(_values.optionsSourceDatabaseCustomContent)
            );
        }

        if (_values.databaseAttributeString.length === 0) {
            readOnly = _values.customEditability === "never";
        }
    }
    if (_values.source === "static" && _values.staticDataSourceCustomContentType !== "no") {
        structurePreviewChildren.push(
            container({ borders: true, borderWidth: 1, backgroundColor: palette.background.topbarData, padding: 1 })({
                type: "Text",
                content: "Configure the selection",
                fontColor: palette.text.data
            })
        );
        _values.optionsSourceStaticDataSource.forEach(value => {
            structurePreviewChildren.push(
                container({
                    borders: true,
                    borderWidth: 1,
                    borderRadius: 2
                })(
                    dropzone(
                        dropzone.placeholder(
                            `Configure the combo box: Place widgets for option ${value.staticDataSourceCaption} here`
                        ),
                        dropzone.hideDataSourceHeaderIf(false)
                    )(value.staticDataSourceCustomContent)
                )
            );
        });
    }
    if (structurePreviewChildren.length === 0) {
        structurePreviewChildren.push({
            type: "Text",
            content: "",
            fontColor: palette.text.data
        });
    }

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
            // ...dropdownPreviewChildren
        ]
    };
}

export function getCustomCaption(_values: SelectionControlsPreviewProps): string {
    return "";
}
