import { Extension } from "@tiptap/core";
import { AllSelection, Plugin, PluginKey, TextSelection, Transaction } from "@tiptap/pm/state";

export interface IndentOptions {
    types: string[];
    minIndent: number;
    maxIndent: number;
    indentStep: number;
    styleDataFormat: "inline" | "class";
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        indent: {
            /**
             * Increase indent
             */
            increaseIndent: () => ReturnType;
            /**
             * Decrease indent
             */
            decreaseIndent: () => ReturnType;
        };
    }
}

export const Indent = Extension.create<IndentOptions>({
    name: "indent",

    addOptions() {
        return {
            types: ["paragraph", "heading", "blockquote"],
            minIndent: 0,
            maxIndent: 10,
            indentStep: 1,
            styleDataFormat: "inline"
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    indent: {
                        default: 0,
                        parseHTML: element => {
                            if (this.options.styleDataFormat === "class") {
                                const indent = element.getAttribute("data-indent");
                                return indent ? parseInt(indent, 10) : 0;
                            } else {
                                // Parse from inline style margin-left
                                const marginLeft = element.style.marginLeft;
                                if (marginLeft) {
                                    const match = marginLeft.match(/(\d+(?:\.\d+)?)/);
                                    if (match) {
                                        return Math.round(parseFloat(match[1]) / 2);
                                    }
                                }
                                return 0;
                            }
                        },
                        renderHTML: attributes => {
                            if (!attributes.indent || attributes.indent === 0) {
                                return {};
                            }

                            if (this.options.styleDataFormat === "class") {
                                return {
                                    "data-indent": attributes.indent,
                                    class: `indent-${attributes.indent}`
                                };
                            } else {
                                return {
                                    style: `margin-left: ${attributes.indent * 2}em`
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
            increaseIndent:
                () =>
                ({ tr, state, dispatch }) => {
                    const { selection } = state;
                    tr = tr.setSelection(selection);
                    tr = updateIndentLevel(tr, this.options, "increase");

                    if (tr.docChanged && dispatch) {
                        dispatch(tr);
                        return true;
                    }

                    return false;
                },
            decreaseIndent:
                () =>
                ({ tr, state, dispatch }) => {
                    const { selection } = state;
                    tr = tr.setSelection(selection);
                    tr = updateIndentLevel(tr, this.options, "decrease");

                    if (tr.docChanged && dispatch) {
                        dispatch(tr);
                        return true;
                    }

                    return false;
                }
        };
    },

    addProseMirrorPlugins() {
        const editor = this.editor;

        return [
            new Plugin({
                key: new PluginKey("indentTabHandler"),
                props: {
                    handleKeyDown: (view, event) => {
                        // Only handle Tab and Shift-Tab
                        if (event.key !== "Tab") {
                            return false;
                        }

                        // Only capture Tab if focus is INSIDE the editor content
                        // This allows Tab to work naturally when focus is outside (e.g., on toolbar buttons)
                        const editorDom = view.dom;
                        const activeElement = document.activeElement;

                        if (!editorDom.contains(activeElement)) {
                            // Focus is outside editor - let Tab work naturally
                            return false;
                        }

                        // Focus is inside editor - capture Tab for indentation
                        // Prevent default Tab behavior (focus movement) to keep focus in editor
                        event.preventDefault();
                        event.stopPropagation();

                        // Execute the appropriate indent command
                        const result = event.shiftKey
                            ? editor.commands.decreaseIndent()
                            : editor.commands.increaseIndent();

                        // Return true to indicate we handled the event
                        return result;
                    }
                }
            })
        ];
    }
});

function updateIndentLevel(tr: Transaction, options: IndentOptions, direction: "increase" | "decrease"): Transaction {
    const { doc, selection } = tr;

    if (!doc || !selection) return tr;

    if (!(selection instanceof TextSelection || selection instanceof AllSelection)) {
        return tr;
    }

    const { from, to } = selection;

    doc.nodesBetween(from, to, (node, pos) => {
        if (options.types.includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            let newIndent = currentIndent;

            if (direction === "increase") {
                newIndent = Math.min(currentIndent + options.indentStep, options.maxIndent);
            } else {
                newIndent = Math.max(currentIndent - options.indentStep, options.minIndent);
            }

            if (newIndent !== currentIndent) {
                tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    indent: newIndent
                });
            }
        }
        return true;
    });

    return tr;
}
