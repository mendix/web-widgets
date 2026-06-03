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
             * @param options - String (legacy) or object with fontFamily and optional fontValue
             */
            setFontFamily: (options: string | { fontFamily: string; fontValue?: string }) => ReturnType;
            /**
             * Unset the font family
             */
            unsetFontFamily: () => ReturnType;
        };
    }
}

/**
 * Derive fontValue from fontFamily CSS value
 *
 * This function extracts a simple identifier from a CSS font-family value for use
 * in dropdown matching. The derivation ensures consistent kebab-case formatting.
 *
 * Algorithm:
 * 1. Extract the first font from comma-separated list
 * 2. Remove quotes (single or double)
 * 3. Convert to lowercase
 * 4. Replace spaces with hyphens (kebab-case)
 *
 * Examples:
 * - "arial, helvetica, sans-serif" → "arial"
 * - "'Roboto', sans-serif" → "roboto"
 * - "'Times New Roman', serif" → "times-new-roman"
 *
 * Backward Compatibility:
 * This derivation is used as a fallback for legacy content that lacks the
 * data-font-value attribute. New content stores fontValue explicitly.
 *
 * @param fontFamily - CSS font-family value
 * @returns Font identifier suitable for dropdown value matching
 */
function deriveFontValue(fontFamily: string): string {
    if (!fontFamily) return "";

    // Extract first font from CSS value
    const firstFont = fontFamily.split(",")[0].trim();

    // Remove quotes and normalize to kebab-case
    return firstFont.replace(/['"]/g, "").toLowerCase().replace(/\s+/g, "-");
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
                                },
                                fontValue: {
                                    default: null,
                                    parseHTML: element => {
                                        // Read from data-font-value attribute (new format)
                                        return element.getAttribute("data-font-value") || null;
                                    },
                                    renderHTML: attributes => {
                                        if (!attributes.fontValue) {
                                            return {};
                                        }
                                        // Render as data-font-value for identification
                                        return {
                                            "data-font-value": attributes.fontValue
                                        };
                                    }
                                }
                            }
                        }
                    ];
                },

                addCommands() {
                    return {
                        setFontFamily:
                            (options: string | { fontFamily: string; fontValue?: string }) =>
                            ({ commands }) => {
                                let fontFamily: string;
                                let fontValue: string;

                                if (typeof options === "string") {
                                    // Backward compatibility: string parameter (legacy code)
                                    // Auto-derive fontValue from fontFamily CSS value
                                    fontFamily = options;
                                    fontValue = deriveFontValue(options);
                                } else {
                                    // New format: object parameter (toolbar dropdown uses this)
                                    // fontValue can be explicit or auto-derived if missing
                                    fontFamily = options.fontFamily;
                                    fontValue = options.fontValue || deriveFontValue(options.fontFamily);
                                }

                                return commands.setMark("textStyle", { fontFamily, fontValue });
                            },
                        unsetFontFamily:
                            () =>
                            ({ commands }) => {
                                return commands.unsetMark("textStyle");
                            }
                    };
                }
            })
        ];
    }
});
