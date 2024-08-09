import { Properties, hidePropertyIn, hidePropertiesIn } from "@mendix/pluggable-widgets-tools";
import { StructurePreviewProps } from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { RichTextPreviewProps } from "typings/RichTextProps";
import RichTextPreviewSVGDark from "./assets/rich-text-preview-dark.svg";
import RichTextPreviewSVGLight from "./assets/rich-text-preview-light.svg";

const toolbarGroupKeys: Array<keyof RichTextPreviewProps> = [
    "history",
    "fontStyle",
    "fontScript",
    "fontColor",
    "list",
    "indent",
    "embed",
    "align",
    "code",
    "header",
    "remove"
];

export function getProperties(values: RichTextPreviewProps, defaultProperties: Properties): Properties {
    if (values.preset !== "custom") {
        hidePropertiesIn(defaultProperties, values, toolbarGroupKeys.concat(["toolbarConfig", "advancedConfig"]));
    }

    if (values.toolbarConfig === "basic") {
        hidePropertyIn(defaultProperties, values, "advancedConfig");
    }
    if (values.toolbarConfig === "advanced") {
        hidePropertiesIn(defaultProperties, values, toolbarGroupKeys);
    }

    if (values.heightUnit === "pixels") {
        hidePropertyIn(defaultProperties, values, "minHeight");
    }

    if (values.widthUnit === "percentage" && values.heightUnit === "percentageOfWidth") {
        hidePropertyIn(defaultProperties, values, "height");
    }

    if (!values.onChange) {
        hidePropertyIn(defaultProperties, values, "onChangeType");
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
