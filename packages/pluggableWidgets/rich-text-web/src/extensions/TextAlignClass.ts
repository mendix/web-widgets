import { Extension } from "@tiptap/core";
import "@tiptap/extension-text-align";

export interface TextAlignOptions {
    types: string[];
    alignments: string[];
    defaultAlignment: string;
    styleDataFormat: "inline" | "class";
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        textAlign: {
            /**
             * Set the text alignment
             */
            setTextAlign: (alignment: string) => ReturnType;
            /**
             * Unset the text alignment
             */
            unsetTextAlign: () => ReturnType;
            /**
             * Toggle the text alignment
             */
            toggleTextAlign: (alignment: string) => ReturnType;
        };
    }
}

export const TextAlign = Extension.create<TextAlignOptions>({
    name: "textAlign",

    addOptions() {
        return {
            types: [],
            alignments: ["left", "center", "right", "justify"],
            defaultAlignment: "left",
            styleDataFormat: "inline"
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    textAlign: {
                        default: null,
                        parseHTML: element => {
                            if (this.options.styleDataFormat === "class") {
                                // Check for class-based alignment first
                                if (element.classList.contains("text-align-left")) return "left";
                                if (element.classList.contains("text-align-center")) return "center";
                                if (element.classList.contains("text-align-right")) return "right";
                                if (element.classList.contains("text-align-justify")) return "justify";
                                // Check data attribute
                                return element.getAttribute("data-text-align") || this.options.defaultAlignment;
                            } else {
                                // Inline mode: parse from style attribute (backwards compatible)
                                return element.style.textAlign || this.options.defaultAlignment;
                            }
                        },
                        renderHTML: attributes => {
                            if (!attributes.textAlign) {
                                return {};
                            }

                            if (this.options.styleDataFormat === "class") {
                                return {
                                    class: `text-align-${attributes.textAlign}`,
                                    "data-text-align": attributes.textAlign
                                };
                            } else {
                                return {
                                    style: `text-align: ${attributes.textAlign}`
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
            setTextAlign:
                (alignment: string) =>
                ({ tr, state, dispatch }) => {
                    const { selection } = state;
                    const { from, to } = selection;

                    if (!this.options.alignments.includes(alignment)) {
                        return false;
                    }

                    let applicable = false;

                    state.doc.nodesBetween(from, to, (node, pos) => {
                        if (this.options.types.includes(node.type.name)) {
                            applicable = true;
                            if (dispatch) {
                                tr.setNodeMarkup(pos, undefined, {
                                    ...node.attrs,
                                    textAlign: alignment
                                });
                            }
                        }
                    });

                    if (!applicable) {
                        return false;
                    }

                    if (dispatch) {
                        dispatch(tr);
                    }

                    return true;
                },
            unsetTextAlign:
                () =>
                ({ tr, state, dispatch }) => {
                    const { selection } = state;
                    const { from, to } = selection;
                    let applicable = false;

                    state.doc.nodesBetween(from, to, (node, pos) => {
                        if (this.options.types.includes(node.type.name)) {
                            applicable = true;
                            if (dispatch) {
                                const newAttrs = { ...node.attrs };
                                delete newAttrs.textAlign;
                                tr.setNodeMarkup(pos, undefined, newAttrs);
                            }
                        }
                    });

                    if (!applicable) {
                        return false;
                    }

                    if (dispatch) {
                        dispatch(tr);
                    }

                    return true;
                },
            toggleTextAlign:
                (alignment: string) =>
                ({ tr, state, dispatch }) => {
                    const { selection } = state;
                    const { from, to } = selection;

                    if (!this.options.alignments.includes(alignment)) {
                        return false;
                    }

                    let applicable = false;

                    state.doc.nodesBetween(from, to, (node, pos) => {
                        if (this.options.types.includes(node.type.name)) {
                            applicable = true;
                            if (dispatch) {
                                tr.setNodeMarkup(pos, undefined, {
                                    ...node.attrs,
                                    textAlign: alignment
                                });
                            }
                        }
                    });

                    if (!applicable) {
                        return false;
                    }

                    if (dispatch) {
                        dispatch(tr);
                    }

                    return true;
                }
        };
    }
});
