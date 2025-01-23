import { hidePropertyIn, Problem, Properties } from "@mendix/pluggable-widgets-tools";
import { chevronDownIcon, chevronDownIconDark } from "@mendix/widget-plugin-filtering/preview/editor-preview-icons";
import {
    ContainerProps,
    ImageProps,
    structurePreviewPalette,
    StructurePreviewProps,
    text
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { DatagridDropdownFilterPreviewProps } from "../typings/DatagridDropdownFilterProps";

export function getProperties(values: DatagridDropdownFilterPreviewProps, defaultProperties: Properties): Properties {
    const showTagPickerProps = values.filterable && values.multiSelect;

    if (values.auto) {
        hidePropertyIn(defaultProperties, values, "filterOptions");
    }

    if (values.filterable) {
        hidePropertyIn(defaultProperties, values, "clearable");
    }

    if (!showTagPickerProps) {
        hidePropertyIn(defaultProperties, values, "selectionMethod");
        hidePropertyIn(defaultProperties, values, "selectedItemsStyle");
    }

    return defaultProperties;
}

export const getPreview = (values: DatagridDropdownFilterPreviewProps, isDarkMode: boolean): StructurePreviewProps => {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    return {
        type: "RowLayout",
        borders: true,
        borderRadius: 5,
        borderWidth: 1,
        columnSize: "grow",
        children: [
            {
                type: "RowLayout",
                columnSize: "grow",
                backgroundColor: palette.background.container,
                children: [
                    {
                        type: "Container",
                        padding: 8,
                        children: [
                            text({
                                fontColor: palette.text.secondary,
                                italic: true
                            })(values.emptyOptionCaption || " ")
                        ],
                        grow: 1
                    } as ContainerProps,
                    {
                        type: "Container",
                        padding: 2,
                        grow: 0,
                        children: [
                            {
                                type: "Image",
                                document: isDarkMode ? chevronDownIconDark : chevronDownIcon
                            } as ImageProps
                        ]
                    } as ContainerProps
                ]
            }
        ]
    };
};

export function check(_props: DatagridDropdownFilterPreviewProps): Problem[] {
    const errors: Problem[] = [];

    return errors;
}
