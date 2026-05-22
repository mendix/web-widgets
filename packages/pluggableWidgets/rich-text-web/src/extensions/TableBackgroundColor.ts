import { Table } from "@tiptap/extension-table";

export type TableBackgroundColorOptions = {
    resizable?: boolean;
    styleDataFormat: "inline" | "class";
};

export const TableBackgroundColor = Table.extend<TableBackgroundColorOptions>({
    addOptions() {
        return {
            ...this.parent?.(),
            resizable: true,
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
            }
        };
    }
});
