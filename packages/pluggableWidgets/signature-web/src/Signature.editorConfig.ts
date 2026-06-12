import { hidePropertiesIn, hidePropertyIn, Properties } from "@mendix/pluggable-widgets-tools";
import {
    container,
    rowLayout,
    structurePreviewPalette,
    StructurePreviewProps,
    text
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { SignaturePreviewProps } from "../typings/SignatureProps";

export function getProperties(
    values: SignaturePreviewProps,
    defaultProperties: Properties /* , target: Platform*/
): Properties {
    if (values.heightUnit === "auto") {
        hidePropertyIn(defaultProperties, values, "height");
    } else {
        hidePropertiesIn(defaultProperties, values, [
            "minHeight",
            "minHeightUnit",
            "maxHeight",
            "maxHeightUnit",
            "overflowY"
        ]);
    }

    if (values.minHeightUnit === "none") {
        hidePropertyIn(defaultProperties, values, "minHeight");
    }

    if (values.maxHeightUnit === "none") {
        hidePropertiesIn(defaultProperties, values, ["maxHeight", "overflowY"]);
    }

    return defaultProperties;
}

export function getPreview(values: SignaturePreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];

    return rowLayout({ columnSize: "grow", borders: true, backgroundColor: palette.background.containerFill })(
        container()(),
        rowLayout({ grow: 2, padding: 8 })(
            text({ fontColor: palette.text.primary, grow: 10 })(getCustomCaption(values))
        ),
        container()()
    );
}

export function getCustomCaption(values: SignaturePreviewProps, _platform = "desktop"): string {
    const caption = values.imageSource
        ? `[${values.imageSource?.type} - ${values.imageSource?.type === "static" ? values.imageSource.imageUrl : values.imageSource?.entity}] Signature`
        : "[Configure Signature]";
    return caption;
}
