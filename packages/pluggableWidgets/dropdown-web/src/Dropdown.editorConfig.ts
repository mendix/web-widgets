import { StructurePreviewProps } from "@mendix/pluggable-widgets-commons";
import { hidePropertiesIn, Properties } from "@mendix/pluggable-widgets-tools";
import { DropdownPreviewProps } from "../typings/DropdownProps";

export function getProperties(values: DropdownPreviewProps, defaultProperties: Properties): Properties {
    if (values.optionCaption === "custom") {
        hidePropertiesIn(defaultProperties, values, ["optionTextTemplate"]);
    }
    if (!values.showLabel) {
        hidePropertiesIn(defaultProperties, values, ["labelCaption"]);
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
