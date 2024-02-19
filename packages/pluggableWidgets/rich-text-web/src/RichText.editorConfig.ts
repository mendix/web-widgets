import { Properties, hidePropertiesIn } from "@mendix/pluggable-widgets-tools";
import { StructurePreviewProps } from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { RichTextPreviewProps } from "typings/RichTextProps";
import RichTextPreviewSVGDark from "./assets/rich-text-preview-dark.svg";
import RichTextPreviewSVGLight from "./assets/rich-text-preview-light.svg";

export const toolbarGroups: Array<keyof RichTextPreviewProps> = [
    "basicstyle",
    "extendedstyle",
    "textalign",
    "clipboard",
    "fontstyle",
    "paragraph",
    "document",
    "history",
    "accordion",
    "code",
    "anchor",
    "direction",
    "link",
    "list",
    "preview",
    "table",
    "visualaid",
    "media",
    "util",
    "emoticon",
    "remove"
];

export const menubarGroups: Array<keyof RichTextPreviewProps> = [
    "fileMenubar",
    "editMenubar",
    "insertMenubar",
    "viewMenubar",
    "formatMenubar",
    "tableMenubar",
    "toolsMenubar",
    "helpMenubar"
];

export function getProperties(values: RichTextPreviewProps, defaultProperties: Properties): Properties {
    if (values.preset !== "custom") {
        hidePropertiesIn(defaultProperties, values, toolbarGroups.concat(["toolbarConfig", "advancedConfig"]));
    }

    if (values.menubarMode !== "custom") {
        hidePropertiesIn(defaultProperties, values, menubarGroups.concat(["menubarConfig", "advancedMenubarConfig"]));
    }

    if (values.toolbarConfig === "basic") {
        hidePropertiesIn(defaultProperties, values, ["advancedConfig"]);
    }
    if (values.toolbarConfig === "advanced") {
        hidePropertiesIn(defaultProperties, values, toolbarGroups);
    }

    if (values.menubarConfig === "basic") {
        hidePropertiesIn(defaultProperties, values, ["advancedMenubarConfig"]);
    }
    if (values.menubarConfig === "advanced") {
        hidePropertiesIn(defaultProperties, values, menubarGroups);
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
