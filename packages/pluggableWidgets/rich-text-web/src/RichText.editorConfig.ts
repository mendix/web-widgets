import { Properties, hidePropertiesIn } from "@mendix/pluggable-widgets-tools";
import { StructurePreviewProps } from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { RichTextPreviewProps } from "typings/RichTextProps";
import RichTextPreviewSVGDark from "./assets/rich-text-preview-dark.svg";
import RichTextPreviewSVGLight from "./assets/rich-text-preview-light.svg";

export function getProperties(values: RichTextPreviewProps, defaultProperties: Properties): Properties {
    if (!values.enableMenuBar) {
        hidePropertiesIn(defaultProperties, values, ["menubar"]);
    }
    if (values.preset !== "custom") {
        hidePropertiesIn(defaultProperties, values, ["toolbar"]);
    }
    return defaultProperties;
}

export function getPreview(props: RichTextPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const variant = isDarkMode ? RichTextPreviewSVGDark : RichTextPreviewSVGLight;
    const doc = decodeURIComponent(variant.replace("data:image/svg+xml,", ""));

    return {
        type: "Image",
        document: props.stringAttribute ? doc.replace("[No attribute selected]", `[${props.stringAttribute}]`) : doc,
        height: 148
    };
}
