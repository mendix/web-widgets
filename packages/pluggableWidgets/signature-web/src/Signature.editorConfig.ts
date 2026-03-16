import { hidePropertiesIn, hidePropertyIn, Properties } from "@mendix/pluggable-widgets-tools";
import {
    container,
    rowLayout,
    structurePreviewPalette,
    StructurePreviewProps,
    svgImage,
    text
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { SignaturePreviewProps } from "../typings/SignatureProps";

import SignaturePreviewSVG from "./assets/Signature.icon.svg";
import SignaturePreviewDarkSVG from "./assets/Signature.icon.dark.svg";

export function getProperties(
    values: SignaturePreviewProps,
    defaultProperties: Properties /* , target: Platform*/
): Properties {
    if (values.heightUnit === "percentageOfWidth") {
        hidePropertyIn(defaultProperties, values, "height");
    } else {
        hidePropertiesIn(defaultProperties, values, [
            "minHeight",
            "minHeightUnit",
            "maxHeight",
            "maxHeightUnit",
            "OverflowY"
        ]);
    }

    if (values.minHeightUnit === "none") {
        hidePropertyIn(defaultProperties, values, "minHeight");
    }

    if (values.maxHeightUnit === "none") {
        hidePropertiesIn(defaultProperties, values, ["maxHeight", "OverflowY"]);
    }

    return defaultProperties;
}

export function getPreview(_values: SignaturePreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    const normalSVG = isDarkMode ? SignaturePreviewDarkSVG : SignaturePreviewSVG;
    const variant = normalSVG;
    const doc = decodeURIComponent(variant.replace("data:image/svg+xml,", ""));

    return rowLayout({ columnSize: "grow", borders: true, backgroundColor: palette.background.containerFill })(
        container()(),
        rowLayout({ grow: 2, padding: 8 })(
            svgImage({ width: 15, height: 15 })(doc),
            text({ fontColor: palette.text.primary, grow: 10 })("Signature")
        ),
        container()()
    );
}
