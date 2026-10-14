import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { EmbedResize } from "../components/EmbedResize";
import { parseEmbedCode } from "../utils/embedCodeParser";

// Validate an iframe src against the same protocol + domain allowlist the embed
// dialog enforces, so a pasted iframe can't bypass it. Wraps the src in a minimal
// iframe so parseEmbedCode (which expects embed HTML) can vet it.
function isAllowedEmbedSrc(src: string | null | undefined): boolean {
    if (!src) {
        return false;
    }
    return parseEmbedCode(`<iframe src="${src.replace(/"/g, "&quot;")}"></iframe>`).valid;
}

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
                parseHTML: element => {
                    const src = element.querySelector("iframe")?.getAttribute("src");
                    // Drop the src if it isn't on the allowlist; renderHTML then
                    // refuses to emit the iframe, so a hostile paste is neutralized.
                    return isAllowedEmbedSrc(src) ? src : null;
                },
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
        const wrapper = mergeAttributes(
            {
                "data-generic-embed": "",
                class: "generic-embed-wrapper"
            },
            this.options.HTMLAttributes
        );

        // Refuse to render an iframe whose src isn't on the allowlist (e.g. a src
        // that was tampered with in stored data after parsing).
        if (!isAllowedEmbedSrc(HTMLAttributes.src)) {
            return ["div", wrapper];
        }

        // Security: Always add sandbox and other security attributes.
        // Note: allow-scripts and allow-same-origin are intentionally NOT combined,
        // since together they let framed content remove its own sandbox.
        const secureAttributes = {
            src: HTMLAttributes.src,
            width: HTMLAttributes.width,
            height: HTMLAttributes.height,
            title: HTMLAttributes.title,
            frameborder: HTMLAttributes.frameborder || "0",
            allow: HTMLAttributes.allow,
            allowfullscreen: HTMLAttributes.allowfullscreen ? "" : undefined,
            // Security attributes
            sandbox: "allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-presentation",
            loading: "lazy",
            referrerpolicy: "strict-origin-when-cross-origin"
        };

        return ["div", wrapper, ["iframe", secureAttributes]];
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
