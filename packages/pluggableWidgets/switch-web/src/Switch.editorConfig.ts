import { StructurePreviewProps } from "@mendix/pluggable-widgets-commons";

import checkedSVG from "./assets/checked.svg";
import checkedSVGDark from "./assets/checked-dark.svg";

export function getPreview(_: StructurePreviewProps, isDarkMode: boolean): StructurePreviewProps {
    return {
        type: "Image",
        document: decodeURIComponent((isDarkMode ? checkedSVGDark : checkedSVG).replace("data:image/svg+xml,", "")),
        width: 80
    };
}
