import { Extension } from "@tiptap/core";
import { Highlight } from "@tiptap/extension-highlight";

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
                                if (!attributes.color) {
                                    return {};
                                }

                                if (styleDataFormat === "class") {
                                    return {
                                        "data-text-highlight": attributes.color,
                                        class: "has-text-highlight"
                                    };
                                } else {
                                    return {
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
                            tag: "mark",
                            getAttrs: element => {
                                const htmlElement = element as HTMLElement;
                                const hasStyles =
                                    htmlElement.hasAttribute("style") ||
                                    htmlElement.hasAttribute("data-text-highlight") ||
                                    htmlElement.style.backgroundColor;

                                if (!hasStyles) {
                                    return false;
                                }

                                return {};
                            }
                        }
                    ];
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
