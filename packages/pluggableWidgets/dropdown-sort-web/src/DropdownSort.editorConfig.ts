import {
    ContainerProps,
    ImageProps,
    StructurePreviewProps,
    text,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { DropdownSortPreviewProps } from "../typings/DropdownSortProps";

const chevronDownIcon = `<?xml version="1.0" encoding="UTF-8"?><svg width="32px" height="32px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>Date picker Copy</title><g id="Date-picker-Copy" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><path d="M13.8572959,21 C13.637883,21 13.4184701,20.918335 13.2513392,20.7558384 C12.9162203,20.4300119 12.9162203,19.9033562 13.2513392,19.5775296 L16.9307907,16.0001042 L13.2513392,12.4226787 C12.9162203,12.0968521 12.9162203,11.5701965 13.2513392,11.2443699 C13.5864581,10.9185434 14.1281337,10.9185434 14.4632526,11.2443699 L18.7486608,15.4109498 C19.0837797,15.7367763 19.0837797,16.263432 18.7486608,16.5892586 L14.4632526,20.7558384 C14.2961217,20.918335 14.0767088,21 13.8572959,21" id="Icon" fill="#0A1325" transform="translate(16.000000, 16.000000) rotate(90.000000) translate(-16.000000, -16.000000) "></path></g></svg>`;
const chevronDownIconDark = `<?xml version="1.0" encoding="UTF-8"?><svg width="32px" height="32px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>Date picker Copy</title><g id="Date-picker-Copy" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><path d="M13.8572959,21 C13.637883,21 13.4184701,20.918335 13.2513392,20.7558384 C12.9162203,20.4300119 12.9162203,19.9033562 13.2513392,19.5775296 L16.9307907,16.0001042 L13.2513392,12.4226787 C12.9162203,12.0968521 12.9162203,11.5701965 13.2513392,11.2443699 C13.5864581,10.9185434 14.1281337,10.9185434 14.4632526,11.2443699 L18.7486608,15.4109498 C19.0837797,15.7367763 19.0837797,16.263432 18.7486608,16.5892586 L14.4632526,20.7558384 C14.2961217,20.918335 14.0767088,21 13.8572959,21" id="Icon" fill="#579BF9" transform="translate(16.000000, 16.000000) rotate(90.000000) translate(-16.000000, -16.000000) "></path></g></svg>`;

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
