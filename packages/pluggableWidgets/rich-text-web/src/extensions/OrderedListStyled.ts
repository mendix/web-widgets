import { mergeAttributes } from "@tiptap/core";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { computeMarkerLength, computeMaxMarkerSize, maxMarkerSizeToAttrs } from "../utils/markerFormat";

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

    // Publishes the largest marker size among direct items, plus how many characters the
    // longest counter takes, so the stylesheet can widen the marker gutter to fit. Delegates
    // to the parent, which handles the `start` and `type` attributes specially. Kept fresh in
    // the live view by the decoration plugin in ListItemMarkerFormat.
    renderHTML(props) {
        const { node, HTMLAttributes } = props;
        const merged = mergeAttributes(
            HTMLAttributes,
            maxMarkerSizeToAttrs(computeMaxMarkerSize(node), this.options.styleDataFormat, computeMarkerLength(node))
        );

        // `OrderedList` always defines `renderHTML`; the fallback only guards against an
        // upstream change removing it.
        return this.parent?.({ ...props, HTMLAttributes: merged }) ?? ["ol", merged, 0];
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
