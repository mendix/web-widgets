import { Extension, getStyleProperty } from "@tiptap/core";
import { TextStyle } from "@tiptap/extension-text-style";

export type TextColorClassOptions = {
    types: string[];
    styleDataFormat: "inline" | "class";
};

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        textColorClass: {
            /**
             * Set the text color using class-based approach
             */
            setTextColor: (color: string) => ReturnType;
            /**
             * Unset the text color
             */
            unsetTextColor: () => ReturnType;
        };
    }
}

export const TextColorClass = Extension.create<TextColorClassOptions>({
    name: "textColorClass",

    addOptions() {
        return {
            types: ["textStyle"],
            styleDataFormat: "inline"
        };
    },

    addExtensions() {
        const styleDataFormat = this.options.styleDataFormat;

        return [
            TextStyle.extend({
                parseHTML() {
                    return [
                        {
                            tag: "span",
                            getAttrs: element => {
                                const htmlElement = element as HTMLElement;
                                const hasStyles =
                                    styleDataFormat === "class"
                                        ? htmlElement.dataset.textColor
                                        : htmlElement.style.color;

                                if (!hasStyles) {
                                    return false;
                                }

                                return {};
                            }
                        }
                    ];
                }
            })
        ];
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    textColor: {
                        default: null,
                        parseHTML: element => {
                            if (this.options.styleDataFormat === "class") {
                                return element.getAttribute("data-text-color") || element.style.color || null;
                            } else {
                                const value = getStyleProperty(element, "color") ?? element.style.color;
                                return value?.replace(/['"]+/g, "") || null;
                            }
                        },
                        renderHTML: attributes => {
                            if (!attributes.textColor) {
                                return {};
                            }

                            if (this.options.styleDataFormat === "class") {
                                return {
                                    "data-text-color": attributes.textColor,
                                    class: "has-text-color"
                                };
                            } else {
                                return {
                                    style: `color: ${attributes.textColor}`
                                };
                            }
                        }
                    }
                }
            }
        ];
    },

    addCommands() {
        return {
            setTextColor:
                (color: string) =>
                ({ chain }) => {
                    return chain().setMark("textStyle", { textColor: color }).run();
                },
            unsetTextColor:
                () =>
                ({ chain }) => {
                    return chain().setMark("textStyle", { textColor: null }).unsetMark("textStyle").run();
                }
        };
    }
});
