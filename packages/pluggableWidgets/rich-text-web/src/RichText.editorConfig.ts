import { hidePropertiesIn, hidePropertyIn, Properties } from "@mendix/pluggable-widgets-tools";
import {
    container,
    dropzone,
    rowLayout,
    StructurePreviewProps
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { RichTextPreviewProps } from "typings/RichTextProps";

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

    if (values.enableStatusBar === false) {
        hidePropertyIn(defaultProperties, values, "statusBarContent");
    }
    return defaultProperties;
}

export function getPreview(props: RichTextPreviewProps, _isDarkMode: boolean): StructurePreviewProps {
    const richTextPreview = container()(
        rowLayout({ columnSize: "grow", borders: false })({
            type: "Container",
            children: [
                {
                    type: "Text",
                    content: props.stringAttribute ? `Rich Text: ${props.stringAttribute}` : "Rich Text Editor"
                }
            ]
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
