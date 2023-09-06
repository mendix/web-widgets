import { WebIcon } from "mendix";

declare interface GlyphIcon {
    readonly type: "glyph";
    readonly iconClass: string;
}

declare interface WebImageIcon {
    readonly type: "image";
    readonly iconUrl: string;
}

declare interface PreviewWebImageIcon {
    readonly type: "image";
    readonly imageUrl: string;
}

declare interface Icon {
    readonly type: "icon";
    readonly iconClass: string;
}

export function mapPreviewIconToWebIcon(
    icon?: GlyphIcon | WebImageIcon | PreviewWebImageIcon | Icon | undefined | null
): WebIcon {
    if (icon) {
        if (icon.type === "image") {
            return {
                type: "image",
                iconUrl: "iconUrl" in icon ? icon.iconUrl : icon.imageUrl
            };
        }
        return icon;
    }
    return undefined;
}
