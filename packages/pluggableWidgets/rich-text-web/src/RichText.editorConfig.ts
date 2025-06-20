import { Properties, hidePropertyIn, hidePropertiesIn } from "@mendix/pluggable-widgets-tools";
import {
    StructurePreviewProps,
    dropzone,
    container,
    rowLayout
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
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
    "remove",
    "view",
    "tableBetter"
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

    if (!values.onChange) {
        hidePropertyIn(defaultProperties, values, "onChangeType");
    }
    if (values.toolbarLocation === "hide") {
        hidePropertyIn(defaultProperties, values, "preset");
    }

    if (values.imageSource === "none" || values.imageSource === null) {
        hidePropertiesIn(defaultProperties, values, ["imageSourceContent", "enableDefaultUpload"]);
    }
    return defaultProperties;
}

export function getPreview(props: RichTextPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const variant = isDarkMode ? RichTextPreviewSVGDark : RichTextPreviewSVGLight;
    const doc = decodeURIComponent(variant.replace("data:image/svg+xml,", ""));

    const richTextPreview = container()(
        rowLayout({ columnSize: "grow", borders: false })({
            type: "Image",
            document: props.stringAttribute
                ? doc.replace("[No attribute selected]", `[${props.stringAttribute}]`)
                : doc,
            height: 150
        })
    );

    if (props.imageSource) {
        richTextPreview.children?.push(
            rowLayout({ columnSize: "grow", borders: true, borderWidth: 1, borderRadius: 2 })(
                dropzone(
                    dropzone.placeholder("Place image selection widget here"),
                    dropzone.hideDataSourceHeaderIf(false)
                )(props.imageSourceContent)
            )
        );
    }
    return richTextPreview;
}
