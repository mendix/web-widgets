import { OrderedList } from "@tiptap/extension-ordered-list";

export interface OrderedListStyledOptions {
    styleDataFormat: "inline" | "class";
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        orderedListStyled: {
            setOrderedListStyle: (styleType: "lower-alpha" | "lower-roman" | null) => ReturnType;
        };
    }
}

export const OrderedListStyled = OrderedList.extend<OrderedListStyledOptions>({
    name: "orderedList",

    addOptions() {
        return {
            ...this.parent?.(),
            styleDataFormat: "inline"
        };
    },

    addAttributes() {
        return {
            ...this.parent?.(),
            listStyleType: {
                default: null,
                parseHTML: element => {
                    // Parse from inline style
                    const inlineStyle = element.style.listStyleType;
                    if (inlineStyle && ["decimal", "lower-alpha", "lower-roman"].includes(inlineStyle)) {
                        return inlineStyle;
                    }

                    // Parse from data attribute
                    const dataStyle = element.getAttribute("data-list-style");
                    if (dataStyle && ["decimal", "lower-alpha", "lower-roman"].includes(dataStyle)) {
                        return dataStyle;
                    }

                    return null;
                },
                renderHTML: attributes => {
                    if (!attributes.listStyleType) {
                        return {};
                    }

                    if (this.options.styleDataFormat === "class") {
                        return {
                            "data-list-style": attributes.listStyleType,
                            class: `list-style-${attributes.listStyleType}`
                        };
                    } else {
                        return {
                            style: `list-style-type: ${attributes.listStyleType};`
                        };
                    }
                }
            }
        };
    },

    addCommands() {
        return {
            ...this.parent?.(),
            setOrderedListStyle:
                (styleType: "lower-alpha" | "lower-roman" | null) =>
                ({ commands, editor }) => {
                    if (!editor.isActive("orderedList")) {
                        return false;
                    }

                    return commands.updateAttributes("orderedList", { listStyleType: styleType });
                }
        };
    }
});
