import { Extension, getStyleProperty } from "@tiptap/core";
import { isSafeCssSize } from "../utils/helpers";

export interface FontSizeOptions {
    types: string[];
    styleDataFormat: "inline" | "class";
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        fontSize: {
            /**
             * Set the font size
             */
            setFontSize: (size: string) => ReturnType;
            /**
             * Unset the font size
             */
            unsetFontSize: () => ReturnType;
        };
    }
}

export const FontSize = Extension.create<FontSizeOptions>({
    name: "fontSize",

    addOptions() {
        return {
            types: ["textStyle"],
            styleDataFormat: "inline"
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => {
                            if (this.options.styleDataFormat === "class") {
                                return element.getAttribute("data-font-size") || element.style.fontSize || null;
                            } else {
                                const value = getStyleProperty(element, "font-size") ?? element.style.fontSize;
                                return value?.replace(/['"]+/g, "") || null;
                            }
                        },
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {};
                            }

                            if (this.options.styleDataFormat === "class") {
                                // Extract numeric value without unit suffix (e.g., "16px" -> "16")
                                const match = attributes.fontSize.match(/^(\d+(?:\.\d+)?)/);
                                if (!match) {
                                    return {};
                                }

                                return {
                                    "data-font-size": match[1],
                                    class: "has-font-size"
                                };
                            } else {
                                // isSafeCssSize accepts the same length/percentage grammar font-size uses.
                                if (!isSafeCssSize(attributes.fontSize)) {
                                    return {};
                                }
                                return {
                                    style: `font-size: ${attributes.fontSize}`
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
            setFontSize:
                fontSize =>
                ({ chain }) => {
                    return chain().setMark("textStyle", { fontSize }).run();
                },
            unsetFontSize:
                () =>
                ({ chain }) => {
                    return chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run();
                }
        };
    }
});
