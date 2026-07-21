import { Image } from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageResize as ImageResizeComponent } from "../components/ImageResize";

export type ImageResizeOptions = {
    inline?: boolean;
    allowBase64?: boolean;
    HTMLAttributes?: Record<string, any>;
};

export const ImageResize = Image.extend<ImageResizeOptions>({
    addOptions() {
        return {
            ...this.parent?.(),
            inline: true,
            allowBase64: true,
            HTMLAttributes: {
                class: "tiptap-image"
            }
        };
    },

    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
                parseHTML: element => element.getAttribute("width"),
                renderHTML: attributes => {
                    if (!attributes.width) {
                        return {};
                    }
                    return { width: attributes.width };
                }
            },
            height: {
                default: null,
                parseHTML: element => element.getAttribute("height"),
                renderHTML: attributes => {
                    if (!attributes.height) {
                        return {};
                    }
                    return { height: attributes.height };
                }
            },
            dataEntity: {
                default: null,
                parseHTML: element => {
                    const value = element.dataset?.entity;
                    return value === "true" ? true : null;
                },
                renderHTML: attributes => {
                    if (!attributes.dataEntity) {
                        return {};
                    }
                    return {
                        "data-entity": "true"
                    };
                }
            },
            dataEntityId: {
                default: null,
                parseHTML: element => {
                    return element.dataset?.src || null;
                },
                renderHTML: attributes => {
                    if (!attributes.dataEntityId) {
                        return {};
                    }
                    return {
                        "data-src": attributes.dataEntityId
                    };
                }
            }
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageResizeComponent);
    }
});
