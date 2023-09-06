import { DatagridDropdownFilterPreviewProps } from "../typings/DatagridDropdownFilterProps";
import { chevronDownIcon, chevronDownIconDark } from "@mendix/widget-plugin-filter-selector/editor-preview-icons";
import {
    ContainerProps,
    ImageProps,
    StructurePreviewProps,
    text,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { hidePropertiesIn, hidePropertyIn, Problem, Properties } from "@mendix/pluggable-widgets-tools";

export function getProperties(
    values: DatagridDropdownFilterPreviewProps,
    defaultProperties: Properties,
    platform: "web" | "desktop"
): Properties {
    if (values.auto) {
        hidePropertyIn(defaultProperties, values, "filterOptions");
    }
    if (platform === "web") {
        if (!values.advanced) {
            hidePropertiesIn(defaultProperties, values, ["onChange", "valueAttribute"]);
        }
    } else {
        hidePropertyIn(defaultProperties, values, "advanced");
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
