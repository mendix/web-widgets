import { StructurePreviewProps } from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { hidePropertyIn, Properties, transformGroupsIntoTabs } from "@mendix/pluggable-widgets-tools";

import { BarcodeScannerContainerProps } from "../typings/BarcodeScannerProps";
import BarcodeScannerSvg from "./assets/barcodescanner.svg";
import BarcodeScannerSvgDark from "./assets/barcodescanner-dark.svg";

export function getProperties(
    values: BarcodeScannerContainerProps,
    defaultProperties: Properties,
    platform: "web" | "desktop"
): Properties {
    if (platform === "web") {
        transformGroupsIntoTabs(defaultProperties);
    }
    if (values.useAllFormats) {
        hidePropertyIn(defaultProperties, values, "barcodeFormats");
    }
    return defaultProperties;
}

export function getPreview(_: StructurePreviewProps, isDarkMode: boolean): StructurePreviewProps | null {
    return {
        type: "Image",
        document: decodeURIComponent(
            (isDarkMode ? BarcodeScannerSvgDark : BarcodeScannerSvg).replace("data:image/svg+xml,", "")
        ),
        height: 275,
        width: 275
    };
}
