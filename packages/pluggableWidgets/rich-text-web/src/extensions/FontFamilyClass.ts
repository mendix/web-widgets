import { Extension, getStyleProperty } from "@tiptap/core";
import { FontFamily } from "@tiptap/extension-font-family";

export type FontFamilyClassOptions = {
    types: string[];
    styleDataFormat: "inline" | "class";
};

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        fontFamilyClass: {
            /**
             * Set the font family
             */
            setFontFamily: (fontFamily: string) => ReturnType;
            /**
             * Unset the font family
             */
            unsetFontFamily: () => ReturnType;
        };
    }
}

export const FontFamilyClass = Extension.create<FontFamilyClassOptions>({
    name: "fontFamilyClass",

    addOptions() {
        return {
            types: ["textStyle"],
            styleDataFormat: "inline"
        };
    },

    addExtensions() {
        const styleDataFormat = this.options.styleDataFormat;

        return [
            FontFamily.extend({
                addGlobalAttributes() {
                    return [
                        {
                            types: this.options.types,
                            attributes: {
                                fontFamily: {
                                    default: null,
                                    parseHTML: element => {
                                        if (styleDataFormat === "class") {
                                            return (
                                                element.getAttribute("data-font-family") ||
                                                element.style.fontFamily ||
                                                null
                                            );
                                        } else {
                                            const value =
                                                getStyleProperty(element, "font-family") ?? element.style.fontFamily;
                                            return value?.replace(/['"]+/g, "") || null;
                                        }
                                    },
                                    renderHTML: attributes => {
                                        if (!attributes.fontFamily) {
                                            return {};
                                        }

                                        if (styleDataFormat === "class") {
                                            return {
                                                "data-font-family": attributes.fontFamily,
                                                class: "has-font-family"
                                            };
                                        } else {
                                            return {
                                                style: `font-family: ${attributes.fontFamily}`
                                            };
                                        }
                                    }
                                }
                            }
                        }
                    ];
                }
            })
        ];
    }
});
