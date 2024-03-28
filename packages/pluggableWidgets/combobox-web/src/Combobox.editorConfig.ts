import { Properties, hidePropertiesIn, hideNestedPropertiesIn } from "@mendix/pluggable-widgets-tools";
import {
    ContainerProps,
    StructurePreviewProps,
    structurePreviewPalette,
    dropzone,
    container
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { ComboboxPreviewProps } from "../typings/ComboboxProps";
import { getDatasourcePlaceholderText } from "./helpers/utils";
import IconSVG from "./assets/StructurePreviewIcon.svg";
import IconSVGDark from "./assets/StructurePreviewIconDark.svg";

export function getProperties(values: ComboboxPreviewProps, defaultProperties: Properties): Properties {
    if (values.source === "context") {
        hidePropertiesIn(defaultProperties, values, [
            "databaseAttributeString",
            "staticAttribute",
            "staticDataSourceCustomContentType",
            "optionsSourceStaticDataSource",
            "optionsSourceDatabaseCaptionAttribute",
            "optionsSourceDatabaseCaptionExpression",
            "optionsSourceDatabaseCaptionType",
            "optionsSourceDatabaseCustomContent",
            "optionsSourceDatabaseCustomContentType",
            "optionsSourceDatabaseDataSource",
            "optionsSourceDatabaseDefaultValue",
            "optionsSourceDatabaseValueAttribute"
        ]);
        if (["enumeration", "boolean"].includes(values.optionsSourceType)) {
            hidePropertiesIn(defaultProperties, values, [
                "attributeAssociation",
                "optionsSourceAssociationCaptionAttribute",
                "optionsSourceAssociationCaptionExpression",
                "optionsSourceAssociationCaptionType",
                "optionsSourceAssociationCustomContent",
                "optionsSourceAssociationCustomContentType",
                "optionsSourceAssociationDataSource",
                "selectedItemsStyle",
                "selectionMethod",
                "selectAllButton",
                "selectAllButtonCaption"
            ]);
            if (values.optionsSourceType === "boolean") {
                hidePropertiesIn(defaultProperties, values, ["clearable"]);
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
            } else {
                hidePropertiesIn(defaultProperties, values, ["selectedItemsStyle"]);
            }

            if (values.showFooter === false) {
                hidePropertiesIn(defaultProperties, values, ["menuFooterContent"]);
            }

            if (values.selectAllButton === false) {
                hidePropertiesIn(defaultProperties, values, ["selectAllButtonCaption"]);
            }
        }
    } else if (values.source === "database") {
        hidePropertiesIn(defaultProperties, values, [
            "attributeAssociation",
            "attributeEnumeration",
            "attributeBoolean",
            "optionsSourceType",
            "staticAttribute",
            "staticDataSourceCustomContentType",
            "optionsSourceStaticDataSource",
            "optionsSourceAssociationCaptionType",
            "optionsSourceAssociationCustomContentType",
            "optionsSourceAssociationCustomContent",
            "optionsSourceAssociationDataSource",
            "optionsSourceAssociationCaptionAttribute",
            "optionsSourceAssociationCaptionExpression",
            "selectedItemsStyle",
            "selectionMethod",
            "selectAllButton",
            "selectAllButtonCaption"
        ]);
        if (values.optionsSourceDatabaseCaptionType === "attribute") {
            hidePropertiesIn(defaultProperties, values, ["optionsSourceDatabaseCaptionExpression"]);
        } else {
            hidePropertiesIn(defaultProperties, values, ["optionsSourceDatabaseCaptionAttribute"]);
        }
        if (values.optionsSourceDatabaseCustomContentType === "no") {
            hidePropertiesIn(defaultProperties, values, ["optionsSourceDatabaseCustomContent"]);
        } else {
            hidePropertiesIn(defaultProperties, values, ["selectedItemsStyle"]);
        }
    } else if (values.source === "static") {
        hidePropertiesIn(defaultProperties, values, [
            "attributeAssociation",
            "attributeEnumeration",
            "attributeBoolean",
            "optionsSourceType",
            "optionsSourceAssociationCaptionAttribute",
            "optionsSourceAssociationCaptionExpression",
            "optionsSourceAssociationCaptionType",
            "optionsSourceAssociationCustomContent",
            "optionsSourceAssociationCustomContentType",
            "optionsSourceAssociationDataSource",
            "selectedItemsStyle",
            "selectionMethod",
            "selectAllButton",
            "selectAllButtonCaption",
            "databaseAttributeString",
            "optionsSourceDatabaseCaptionAttribute",
            "optionsSourceDatabaseCaptionExpression",
            "optionsSourceDatabaseCaptionType",
            "optionsSourceDatabaseCustomContent",
            "optionsSourceDatabaseCustomContentType",
            "optionsSourceDatabaseDataSource",
            "optionsSourceDatabaseValueAttribute",
            "optionsSourceDatabaseDefaultValue"
        ]);
    }

    if (values.staticDataSourceCustomContentType === "no") {
        values.optionsSourceStaticDataSource.forEach((_, index) => {
            hideNestedPropertiesIn(defaultProperties, values, "optionsSourceStaticDataSource", index, [
                "staticDataSourceCustomContent"
            ]);
        });
    }

    if (values.filterType === "none" && values.selectionMethod !== "rowclick") {
        hidePropertiesIn(defaultProperties, values, ["noOptionsText"]);
    }

    if (values.selectionMethod === "rowclick") {
        hidePropertiesIn(defaultProperties, values, ["selectedItemsStyle"]);
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

export function getPreview(_values: ComboboxPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    const structurePreviewChildren: StructurePreviewProps[] = [];
    let dropdownPreviewChildren: StructurePreviewProps[] = [];

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
    if (_values.source === "database" && _values.optionsSourceDatabaseCustomContentType !== "no") {
        structurePreviewChildren.push(
            dropzone(
                dropzone.placeholder("Configure the combo box: Place widgets here"),
                dropzone.hideDataSourceHeaderIf(false)
            )(_values.optionsSourceDatabaseCustomContent)
        );
    }
    if (_values.source === "static" && _values.staticDataSourceCustomContentType !== "no") {
        structurePreviewChildren.push(
            container({ borders: true, borderWidth: 1, backgroundColor: palette.background.topbarData, padding: 1 })({
                type: "Text",
                content: getDatasourcePlaceholderText(_values),
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
    if (_values.showFooter === true) {
        dropdownPreviewChildren = [
            container({ padding: 1 })(),
            container({
                borders: true,
                borderWidth: 1,
                borderRadius: 2
            })(
                dropzone(
                    dropzone.placeholder("Configure footer: place widgets here"),
                    dropzone.hideDataSourceHeaderIf(false)
                )(_values.menuFooterContent)
            )
        ];
    }
    if (structurePreviewChildren.length === 0) {
        structurePreviewChildren.push({
            type: "Text",
            content: getDatasourcePlaceholderText(_values),
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
                backgroundColor: _values.readOnly ? palette.background.containerDisabled : palette.background.container,
                children: [
                    {
                        type: "Container",
                        grow: 1,
                        padding: 4,
                        children: structurePreviewChildren
                    },
                    {
                        ...getIconPreview(isDarkMode),
                        ...{ grow: 0, padding: 4 }
                    }
                ]
            },
            ...dropdownPreviewChildren
        ]
    };
}

export function getCustomCaption(values: ComboboxPreviewProps): string {
    return getDatasourcePlaceholderText(values);
}
