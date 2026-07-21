import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { EmbedResize } from "../components/EmbedResize";

export interface GenericEmbedOptions {
    inline: boolean;
    HTMLAttributes: Record<string, any>;
}

export interface GenericEmbedAttributes {
    src: string;
    width?: number;
    height?: number;
    title?: string | null;
    frameborder?: string;
    allow?: string | null;
    allowfullscreen?: boolean;
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        genericEmbed: {
            setGenericEmbed: (options: GenericEmbedAttributes) => ReturnType;
        };
    }
}

export const GenericEmbed = Node.create<GenericEmbedOptions>({
    name: "genericEmbed",

    group: "block",

    atom: true,

    addOptions() {
        return {
            inline: false,
            HTMLAttributes: {}
        };
    },

    addAttributes() {
        return {
            src: {
                default: null,
                parseHTML: element => element.querySelector("iframe")?.getAttribute("src"),
                renderHTML: attributes => {
                    return { src: attributes.src };
                }
            },
            width: {
                default: 640,
                parseHTML: element => {
                    const iframe = element.querySelector("iframe");
                    const widthAttr = iframe?.getAttribute("width");
                    return widthAttr ? parseInt(widthAttr, 10) : 640;
                }
            },
            height: {
                default: 480,
                parseHTML: element => {
                    const iframe = element.querySelector("iframe");
                    const heightAttr = iframe?.getAttribute("height");
                    return heightAttr ? parseInt(heightAttr, 10) : 480;
                }
            },
            title: {
                default: null,
                parseHTML: element => element.querySelector("iframe")?.getAttribute("title")
            },
            frameborder: {
                default: "0"
            },
            allow: {
                default: null
            },
            allowfullscreen: {
                default: true
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: "div[data-generic-embed]"
            }
        ];
    },

    renderHTML({ HTMLAttributes }) {
        // Security: Always add sandbox and other security attributes
        const secureAttributes = {
            src: HTMLAttributes.src,
            width: HTMLAttributes.width,
            height: HTMLAttributes.height,
            title: HTMLAttributes.title,
            frameborder: HTMLAttributes.frameborder || "0",
            allow: HTMLAttributes.allow,
            allowfullscreen: HTMLAttributes.allowfullscreen ? "" : undefined,
            // Security attributes
            sandbox: "allow-scripts allow-same-origin allow-popups allow-forms",
            loading: "lazy",
            referrerpolicy: "strict-origin-when-cross-origin"
        };

        return [
            "div",
            mergeAttributes(
                {
                    "data-generic-embed": "",
                    class: "generic-embed-wrapper"
                },
                this.options.HTMLAttributes
            ),
            ["iframe", secureAttributes]
        ];
    },

    addCommands() {
        return {
            setGenericEmbed:
                (options: GenericEmbedAttributes) =>
                ({ commands }) => {
                    return commands.insertContent({
                        type: this.name,
                        attrs: options
                    });
                }
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(EmbedResize);
    }
});
