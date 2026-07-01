import { mergeAttributes } from "@tiptap/core";
import { TableCell } from "@tiptap/extension-table-cell";
import { DOMOutputSpec } from "@tiptap/pm/model";

// Declare custom commands for cell border styling
declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        tableCellBackgroundColor: {
            setCellBorderColor: (borderColor: string) => ReturnType;
            setCellBorderStyle: (borderStyle: string) => ReturnType;
            setCellBorderWidth: (borderWidth: string) => ReturnType;
        };
    }
}

export type TableCellBackgroundColorOptions = {
    styleDataFormat: "inline" | "class";
};

export const TableCellBackgroundColor = TableCell.extend<TableCellBackgroundColorOptions>({
    addOptions() {
        return {
            ...this.parent?.(),
            styleDataFormat: "inline"
        };
    },

    addAttributes() {
        const styleDataFormat = this.options.styleDataFormat;

        return {
            ...this.parent?.(),
            backgroundColor: {
                default: null,
                parseHTML: element => {
                    if (styleDataFormat === "class") {
                        return element.getAttribute("data-background-color") || null;
                    } else {
                        return element.style.backgroundColor || null;
                    }
                },
                renderHTML: attributes => {
                    if (!attributes.backgroundColor) {
                        return {};
                    }

                    if (styleDataFormat === "class") {
                        return {
                            "data-background-color": attributes.backgroundColor,
                            class: "has-background-color"
                        };
                    } else {
                        return {
                            style: `background-color: ${attributes.backgroundColor}`
                        };
                    }
                }
            },
            // Cell border color attribute - stores custom border color for individual cells
            borderColor: {
                default: null,
                parseHTML: element => {
                    if (styleDataFormat === "class") {
                        return element.getAttribute("data-border-color") || null;
                    } else {
                        return element.style.borderColor || null;
                    }
                },
                renderHTML: attributes => {
                    if (!attributes.borderColor) {
                        return {};
                    }

                    if (styleDataFormat === "class") {
                        return {
                            "data-border-color": attributes.borderColor
                        };
                    } else {
                        return {
                            style: `border-color: ${attributes.borderColor}`
                        };
                    }
                }
            },
            // Cell border style attribute - supports CSS border-style values
            borderStyle: {
                default: null,
                parseHTML: element => {
                    if (styleDataFormat === "class") {
                        return element.getAttribute("data-border-style") || null;
                    } else {
                        return element.style.borderStyle || null;
                    }
                },
                renderHTML: attributes => {
                    if (!attributes.borderStyle) {
                        return {};
                    }

                    if (styleDataFormat === "class") {
                        return {
                            "data-border-style": attributes.borderStyle
                        };
                    } else {
                        return {
                            style: `border-style: ${attributes.borderStyle}`
                        };
                    }
                }
            },
            // Cell border width attribute - stores border width in pixels
            borderWidth: {
                default: null,
                parseHTML: element => {
                    if (styleDataFormat === "class") {
                        return element.getAttribute("data-border-width") || null;
                    } else {
                        return element.style.borderWidth || null;
                    }
                },
                renderHTML: attributes => {
                    if (!attributes.borderWidth) {
                        return {};
                    }

                    if (styleDataFormat === "class") {
                        return {
                            "data-border-width": attributes.borderWidth
                        };
                    } else {
                        return {
                            style: `border-width: ${attributes.borderWidth}`
                        };
                    }
                }
            }
        };
    },

    renderHTML({ HTMLAttributes }): DOMOutputSpec {
        const backgroundColor = HTMLAttributes.backgroundColor;
        const borderColor = HTMLAttributes.borderColor;
        const borderStyle = HTMLAttributes.borderStyle;
        const borderWidth = HTMLAttributes.borderWidth;

        let styleString = "";
        const classAttrs: Record<string, any> = {};

        // Inline mode: build style string with border defaults
        if (this.options.styleDataFormat === "inline") {
            // Background color
            if (backgroundColor) {
                styleString = `background-color: ${backgroundColor}`;
            }

            // Border properties with defaults
            const hasBorderProperties = borderColor || borderStyle || borderWidth;
            if (hasBorderProperties) {
                const effectiveBorderStyle = borderStyle || "solid";
                const effectiveBorderWidth = borderWidth || "1px";

                styleString += styleString
                    ? `; border-style: ${effectiveBorderStyle}`
                    : `border-style: ${effectiveBorderStyle}`;
                styleString += `; border-width: ${effectiveBorderWidth}`;

                if (borderColor) {
                    styleString += `; border-color: ${borderColor}`;
                }
            }
        }

        // Class mode: use data attributes
        if (this.options.styleDataFormat === "class") {
            if (backgroundColor) {
                classAttrs["data-background-color"] = backgroundColor;
                classAttrs.class = "has-background-color";
            }
            if (borderColor || borderStyle || borderWidth) {
                if (borderColor) classAttrs["data-border-color"] = borderColor;
                if (borderStyle) classAttrs["data-border-style"] = borderStyle;
                if (borderWidth) classAttrs["data-border-width"] = borderWidth;
                classAttrs.class = classAttrs.class ? `${classAttrs.class} has-cell-border` : "has-cell-border";
            }
        }

        const attrs = mergeAttributes(
            HTMLAttributes,
            styleString ? { style: styleString } : {},
            this.options.styleDataFormat === "class" ? classAttrs : {}
        );

        return ["td", attrs, 0];
    },

    addCommands() {
        return {
            ...this.parent?.(),
            setCellBorderColor:
                (borderColor: string) =>
                ({ commands }) => {
                    return commands.setCellAttribute("borderColor", borderColor);
                },
            setCellBorderStyle:
                (borderStyle: string) =>
                ({ commands }) => {
                    return commands.setCellAttribute("borderStyle", borderStyle);
                },
            setCellBorderWidth:
                (borderWidth: string) =>
                ({ commands }) => {
                    return commands.setCellAttribute("borderWidth", borderWidth);
                }
        };
    }
});
