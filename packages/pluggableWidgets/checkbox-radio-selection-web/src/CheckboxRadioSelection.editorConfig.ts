import { hideNestedPropertiesIn, hidePropertiesIn, Properties } from "@mendix/pluggable-widgets-tools";
import {
    container,
    ContainerProps,
    dropzone,
    rowLayout,
    structurePreviewPalette,
    StructurePreviewProps,
    text
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { CheckboxRadioSelectionPreviewProps } from "../typings/CheckboxRadioSelectionProps";
import { getCustomCaption } from "./helpers/utils";
import IconRadioButtonSVG from "./assets/radiobutton.svg";
import IconCheckboxSVG from "./assets/checkbox.svg";

const DATABASE_SOURCE_CONFIG: Array<keyof CheckboxRadioSelectionPreviewProps> = [
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

const ASSOCIATION_SOURCE_CONFIG: Array<keyof CheckboxRadioSelectionPreviewProps> = [
    "optionsSourceAssociationCaptionAttribute",
    "optionsSourceAssociationCaptionExpression",
    "optionsSourceAssociationCaptionType",
    "optionsSourceAssociationCustomContent",
    "optionsSourceAssociationDataSource",
    "attributeAssociation"
];

export function getProperties(
    values: CheckboxRadioSelectionPreviewProps & { Editability?: unknown },
    defaultProperties: Properties
): Properties {
    // Basic property hiding logic - can be expanded later
    if (values.source !== "database") {
        hidePropertiesIn(defaultProperties, values, ["customEditability", "customEditabilityExpression"]);
    }

    if (values.optionsSourceType !== "boolean") {
        hidePropertiesIn(defaultProperties, values, ["controlType"]);
    }

    if (values.source === "context") {
        hidePropertiesIn(defaultProperties, values, [
            "staticAttribute",
            "optionsSourceStaticDataSource",
            ...DATABASE_SOURCE_CONFIG
        ]);
        if (["enumeration", "boolean"].includes(values.optionsSourceType)) {
            hidePropertiesIn(defaultProperties, values, [
                "optionsSourceCustomContentType",
                ...ASSOCIATION_SOURCE_CONFIG
            ]);
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

function getIconPreview(isMultiSelect: boolean): ContainerProps {
    return container({ grow: 0 })(container({ padding: 3 })(), {
        type: "Image",
        document: decodeURIComponent(
            (isMultiSelect ? IconCheckboxSVG : IconRadioButtonSVG).replace("data:image/svg+xml,", "")
        ),
        width: 16,
        height: 16
    });
}

export function getPreview(values: CheckboxRadioSelectionPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    const structurePreviewChildren: StructurePreviewProps[] = [];
    let readOnly = values.readOnly;

    // Handle custom content dropzones when enabled
    if (values.optionsSourceCustomContentType !== "no") {
        if (values.source === "context" && values.optionsSourceType === "association") {
            structurePreviewChildren.push(
                dropzone(
                    dropzone.placeholder("Configure the checkbox radio selection: Place widgets here"),
                    dropzone.hideDataSourceHeaderIf(false)
                )(values.optionsSourceAssociationCustomContent)
            );
        } else if (values.source === "database") {
            structurePreviewChildren.push(
                dropzone(
                    dropzone.placeholder("Configure the checkbox radio selection: Place widgets here"),
                    dropzone.hideDataSourceHeaderIf(false)
                )(values.optionsSourceDatabaseCustomContent)
            );

            if (values.databaseAttributeString.length === 0) {
                readOnly = values.customEditability === "never";
            }
        } else if (values.source === "static") {
            values.optionsSourceStaticDataSource.forEach(value => {
                structurePreviewChildren.push(
                    container({
                        borders: true,
                        borderWidth: 1,
                        borderRadius: 2
                    })(
                        dropzone(
                            dropzone.placeholder(
                                `Configure the checkbox radio selection: Place widgets for option ${value.staticDataSourceCaption} here`
                            ),
                            dropzone.hideDataSourceHeaderIf(false)
                        )(value.staticDataSourceCustomContent)
                    )
                );
            });
        }
    }

    // If no custom content dropzones, show default preview
    if (structurePreviewChildren.length === 0) {
        const isMultiSelect = values.optionsSourceDatabaseItemSelection === "Multi";
        return container()(
            rowLayout({
                columnSize: "grow",
                borderRadius: 2,
                backgroundColor: readOnly ? palette.background.containerDisabled : palette.background.container
            })(
                getIconPreview(
                    isMultiSelect || (values.optionsSourceType === "boolean" && values.controlType === "checkbox")
                ),
                container()(container({ padding: 3 })(), text()(getCustomCaption(values)))
            )
        );
    }

    // Return container with dropzones
    return container()(
        rowLayout({
            columnSize: "grow",
            borders: true,
            borderWidth: 1,
            borderRadius: 2,
            backgroundColor: readOnly ? palette.background.containerDisabled : palette.background.container
        })(container({ grow: 1, padding: 4 })(...structurePreviewChildren))
    );
}
