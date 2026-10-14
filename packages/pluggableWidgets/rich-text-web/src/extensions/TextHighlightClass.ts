import { Extension, mergeAttributes } from "@tiptap/core";
import { Highlight } from "@tiptap/extension-highlight";
import { isSafeCssColor } from "../utils/helpers";

export type TextHighlightClassOptions = {
    multicolor: boolean;
    styleDataFormat: "inline" | "class";
};

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        textHighlightClass: {
            /**
             * Set the text highlight color using class-based approach
             */
            setTextHighlight: (color: string) => ReturnType;
            /**
             * Unset the text highlight
             */
            unsetTextHighlight: () => ReturnType;
        };
    }
}

export const TextHighlightClass = Extension.create<TextHighlightClassOptions>({
    name: "textHighlightClass",

    addOptions() {
        return {
            multicolor: true,
            styleDataFormat: "inline"
        };
    },

    addExtensions() {
        const styleDataFormat = this.options.styleDataFormat;

        return [
            Highlight.extend({
                addAttributes() {
                    return {
                        color: {
                            default: null,
                            parseHTML: element => {
                                if (styleDataFormat === "class") {
                                    return element.dataset.textHighlight || null;
                                } else {
                                    return element.style.backgroundColor || null;
                                }
                            },
                            renderHTML: attributes => {
                                if (!attributes.color || !isSafeCssColor(attributes.color)) {
                                    return {};
                                }

                                if (styleDataFormat === "class") {
                                    return {
                                        "data-text-highlight": attributes.color,
                                        class: "has-text-highlight"
                                    };
                                } else {
                                    return {
                                        class: "has-text-highlight",
                                        style: `background-color: ${attributes.color}`
                                    };
                                }
                            }
                        }
                    };
                },
                parseHTML() {
                    return [
                        {
                            tag: "span",
                            getAttrs: element => {
                                const htmlElement = element as HTMLElement;
                                // Only treat a span as a highlight when it actually carries a
                                // background (inline mode, incl. Word's `background` shorthand which
                                // the CSSOM expands into `backgroundColor`) or our data attribute
                                // (class mode). This avoids capturing color-only text-style spans.
                                const hasHighlight =
                                    styleDataFormat === "class"
                                        ? !!htmlElement.dataset.textHighlight
                                        : !!htmlElement.style.backgroundColor;

                                if (!hasHighlight) {
                                    return false;
                                }

                                return {};
                            }
                        }
                    ];
                },
                renderHTML({ HTMLAttributes }) {
                    return ["span", mergeAttributes(HTMLAttributes), 0];
                }
            }).configure({
                multicolor: this.options.multicolor
            })
        ];
    },

    addCommands() {
        return {
            setTextHighlight:
                (color: string) =>
                ({ chain }) => {
                    return chain().setHighlight({ color }).run();
                },
            unsetTextHighlight:
                () =>
                ({ chain }) => {
                    return chain().unsetHighlight().run();
                }
        };
    }
});
