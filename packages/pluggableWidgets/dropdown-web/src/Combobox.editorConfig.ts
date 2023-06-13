import { StructurePreviewProps } from "@mendix/pluggable-widgets-commons";
import { hidePropertiesIn, Properties } from "@mendix/pluggable-widgets-tools";
import { DropdownPreviewProps } from "../typings/DropdownProps";

export function getProperties(values: DropdownPreviewProps, defaultProperties: Properties): Properties {
    if (values.optionsSourceType === "enumeration" || values.optionsSourceType === "boolean") {
        // hide attribute
        hidePropertiesIn(defaultProperties, values, [
            "attributeAssociation",
            "optionsSourceAssociationCaptionType",
            "optionsSourceAssociationCaptionAttribute",
            "optionsSourceAssociationCaptionExpression",
            "optionsSourceAssociationDataSource"
        ]);
        if (values.optionsSourceType === "boolean") {
            hidePropertiesIn(defaultProperties, values, ["clearable"]);
        }
    } else if (values.optionsSourceType === "association") {
        hidePropertiesIn(defaultProperties, values, ["attributeEnumerationOrBoolean"]);
        if (values.optionsSourceAssociationCaptionType === "attribute") {
            hidePropertiesIn(defaultProperties, values, ["optionsSourceAssociationCaptionExpression"]);
        } else {
            hidePropertiesIn(defaultProperties, values, ["optionsSourceAssociationCaptionAttribute"]);
        }

        if (values.optionsSourceAssociationDataSource === null) {
            hidePropertiesIn(defaultProperties, values, ["optionsSourceAssociationCaptionType"]);
        }
    }

    return defaultProperties;
}

export function getPreview(_values: DropdownPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    return {
        type: "RowLayout",
        columnSize: "fixed",
        backgroundColor: isDarkMode
            ? _values.readOnly
                ? "#4F4F4F"
                : undefined
            : _values.readOnly
            ? "#C8C8C8"
            : "#F5F5F5",
        borders: true,
        borderWidth: 1,
        children: [
            {
                type: "Container",
                padding: 4,
                children: [
                    {
                        type: "Text",
                        content: "Combobox",
                        fontColor: isDarkMode ? "#DEDEDE" : "#6B707B"
                    }
                ]
            }
        ]
    };
}
