import { StructurePreviewProps } from "@mendix/pluggable-widgets-commons";
import { hidePropertiesIn, Properties } from "@mendix/pluggable-widgets-tools";
import { DropdownPreviewProps } from "../typings/DropdownProps";

export function getProperties(values: DropdownPreviewProps, defaultProperties: Properties): Properties {
    if (values.optionsSourceType === "enumerationOrBoolean") {
        // hide attribute
        hidePropertiesIn(defaultProperties, values, [
            "attributeAssociation",
            "optionsSourceAssociationCaptionType",
            "optionsSourceAssociationCaptionAttribute",
            "optionsSourceAssociationCaptionExpression",
            "optionsSourceAssociationDataSource"
        ]);

        // clearable is not available in boolean, is it for Enums?
        hidePropertiesIn(defaultProperties, values, ["clearable"]);
    } else if (values.optionsSourceType === "association") {
        hidePropertiesIn(defaultProperties, values, ["attributeEnumerationOrBoolean"]);
        if (values.optionsSourceAssociationCaptionType === "attribute") {
            hidePropertiesIn(defaultProperties, values, ["optionsSourceAssociationCaptionExpression"]);
        } else {
            hidePropertiesIn(defaultProperties, values, ["optionsSourceAssociationCaptionAttribute"]);
        }
    }

    return defaultProperties;
}

export function getPreview(_values: DropdownPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    return {
        type: "RowLayout",
        columnSize: "fixed",
        backgroundColor: isDarkMode ? "#4F4F4F" : "#F5F5F5",
        borders: true,
        borderWidth: 1,
        children: [
            {
                type: "Container",
                padding: 4,
                children: [
                    {
                        type: "Text",
                        content: "Dropdown",
                        fontColor: isDarkMode ? "#DEDEDE" : "#6B707B"
                    }
                ]
            }
        ]
    };
}
