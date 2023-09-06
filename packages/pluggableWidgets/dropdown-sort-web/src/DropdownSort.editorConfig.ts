import {
    ContainerProps,
    ImageProps,
    StructurePreviewProps,
    text,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { DropdownSortPreviewProps } from "../typings/DropdownSortProps";
import { chevronDownIcon, chevronDownIconDark } from "@mendix/widget-plugin-filter-selector/editor-preview-icons";

import AscIcon from "./assets/asc.svg";
import AscIconDark from "./assets/asc-dark.svg";

export const getPreview = (values: DropdownSortPreviewProps, isDarkMode: boolean): StructurePreviewProps => {
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
            },
            {
                type: "Container",
                borders: true,
                borderWidth: 0.5,
                grow: 0
            } as ContainerProps,
            {
                type: "Container",
                grow: 0,
                backgroundColor: palette.background.container,
                children: [
                    {
                        type: "Container",
                        padding: 10,
                        grow: 0,
                        children: [
                            {
                                type: "Image",
                                document: decodeURIComponent(
                                    (isDarkMode ? AscIconDark : AscIcon).replace("data:image/svg+xml,", "")
                                )
                            } as ImageProps
                        ]
                    } as ContainerProps
                ]
            }
        ]
    };
};
