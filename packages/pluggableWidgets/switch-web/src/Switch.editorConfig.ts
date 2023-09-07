import { StructurePreviewProps } from "@mendix/widget-plugin-platform/preview/structure-preview-api";

import checkedSVG from "./assets/checked.svg";
import checkedSVGDark from "./assets/checked-dark.svg";
import { SwitchPreviewProps } from "typings/SwitchProps";

export function getPreview(_: StructurePreviewProps, isDarkMode: boolean): StructurePreviewProps {
    return {
        type: "Image",
        document: decodeURIComponent((isDarkMode ? checkedSVGDark : checkedSVG).replace("data:image/svg+xml,", "")),
        width: 80
    };
}

export function getCustomCaption(values: SwitchPreviewProps, _platform = "desktop"): string {
    return values.booleanAttribute || `Switch`;
}
