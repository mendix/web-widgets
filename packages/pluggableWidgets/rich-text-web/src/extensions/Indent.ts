import { Editor, Extension } from "@tiptap/core";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { AllSelection, Plugin, PluginKey, TextSelection, Transaction } from "@tiptap/pm/state";

const LIST_TYPES = ["bulletList", "orderedList", "taskList"];

/**
 * Width in CSS pixels of one indent level, implied by the render formula
 * `margin-left: ${indent * 2}em` at the 16px default root font size.
 * Independent of `indentStep`, which is the per-keypress increment.
 */
const PX_PER_INDENT_LEVEL = 32;

/**
 * CSS absolute-length factors to pixels, plus the font-relative units resolved
 * against a 16px root. `%` is deliberately absent: it resolves against the
 * containing block's width, which is unknown at parse time.
 */
const PX_PER_UNIT: Record<string, number> = {
    px: 1,
    pt: 4 / 3,
    pc: 16,
    in: 96,
    cm: 96 / 2.54,
    mm: 96 / 25.4,
    em: 16,
    rem: 16
};

const CSS_LENGTH = /^\s*(-?\d*\.?\d+)\s*([a-z]*)\s*$/i;

/**
 * Converts a CSS length to pixels. Returns `null` for values that cannot be
 * resolved without layout (`%`), for unknown units, and for anything unparseable
 * — callers treat `null` as "no indentation".
 */
export function cssLengthToPx(value: string): number | null {
    const match = CSS_LENGTH.exec(value);
    if (!match) {
        return null;
    }

    const amount = parseFloat(match[1]);
    if (!Number.isFinite(amount)) {
        return null;
    }

    // A bare `0` is valid CSS with no unit; any other unitless number is not.
    const unit = match[2].toLowerCase();
    if (!unit) {
        return amount === 0 ? 0 : null;
    }

    const factor = PX_PER_UNIT[unit];
    return factor === undefined ? null : amount * factor;
}

/**
 * Derives an indent level from a `margin-left` value. Floors rather than rounds
 * so a foreign margin never produces *more* indentation than its source: pasting
 * from Word used to blow a 26.1pt margin up to the maximum indent, and
 * under-indenting is the milder failure. The epsilon absorbs float noise from
 * cm/mm conversions landing a hair under a level boundary.
 */
function marginToIndent(marginLeft: string): number {
    const px = cssLengthToPx(marginLeft);
    if (px === null || px <= 0) {
        return 0;
    }
    return Math.floor(px / PX_PER_INDENT_LEVEL + 0.02);
}

export interface IndentOptions {
    /**
     * Node types the margin-indent walk touches (paragraph/heading/blockquote).
     * Used by increaseIndent/decreaseIndent and, in turn, the toolbar buttons.
     * Lists are intentionally excluded so the toolbar stays paragraph-only.
     */
    types: string[];
    /**
     * Node types that carry the `indent` global attribute (parse/render margin).
     * Superset of `types` that also includes list types, so lists can store and
     * render a margin without being swept by the walk. Defaults to `types` when
     * not provided.
     */
    attributeTypes?: string[];
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
            /**
             * Increase margin on the nearest list node (Ctrl+])
             */
            listIndent: () => ReturnType;
            /**
             * Decrease margin on the nearest list node (Ctrl+[)
             */
            listOutdent: () => ReturnType;
        };
    }
}

export const Indent = Extension.create<IndentOptions>({
    name: "indent",

    addOptions() {
        return {
            types: ["paragraph", "heading", "blockquote"],
            attributeTypes: undefined,
            minIndent: 0,
            maxIndent: 10,
            indentStep: 1,
            styleDataFormat: "inline"
        };
    },

    addGlobalAttributes() {
        // Register the `indent` attribute on the attribute types (superset that
        // includes lists) so lists can render a margin, while the walk (`types`)
        // stays paragraph-only.
        const attributeTypes = this.options.attributeTypes ?? this.options.types;

        return [
            {
                types: attributeTypes,
                attributes: {
                    indent: {
                        default: 0,
                        parseHTML: element => {
                            const clamp = (level: number): number =>
                                Math.min(Math.max(Math.round(level), this.options.minIndent), this.options.maxIndent);

                            // `data-indent` is the canonical channel for a level that was
                            // set by code (the Word paste sanitizer writes it), so it wins
                            // in both style modes and needs no unit interpretation.
                            const dataIndent = element.getAttribute("data-indent");
                            if (dataIndent) {
                                const level = parseInt(dataIndent, 10);
                                return Number.isFinite(level) ? clamp(level) : 0;
                            }

                            // Only inline mode expresses indentation as a margin. In class
                            // mode a margin belongs to something else and must not be read
                            // as an indent level.
                            if (this.options.styleDataFormat === "class") {
                                return 0;
                            }

                            const marginLeft = element.style.marginLeft;
                            return marginLeft ? clamp(marginToIndent(marginLeft)) : 0;
                        },
                        renderHTML: attributes => {
                            // Coerce to a finite integer within [minIndent, maxIndent] so a
                            // tampered/NaN value can't emit broken or unbounded CSS.
                            const raw = Number(attributes.indent);
                            if (!Number.isFinite(raw) || raw <= 0) {
                                return {};
                            }
                            const indent = Math.min(
                                Math.max(Math.round(raw), this.options.minIndent),
                                this.options.maxIndent
                            );
                            if (indent <= 0) {
                                return {};
                            }

                            if (this.options.styleDataFormat === "class") {
                                return {
                                    "data-indent": indent,
                                    class: `indent-${indent}`
                                };
                            } else {
                                return {
                                    style: `margin-left: ${indent * 2}em`
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
                },
            listIndent:
                () =>
                ({ editor, tr, dispatch }) =>
                    setListMargin(editor, tr, this.options, dispatch, "increase"),
            listOutdent:
                () =>
                ({ editor, tr, dispatch }) =>
                    setListMargin(editor, tr, this.options, dispatch, "decrease")
        };
    },

    addKeyboardShortcuts() {
        const editor = this.editor;

        return {
            // Ctrl+] / Cmd+] — indent. On a list, margin the list node; otherwise
            // fall back to the paragraph/heading/blockquote margin walk.
            "Mod-]": () => (findListAncestor(editor) ? editor.commands.listIndent() : editor.commands.increaseIndent()),
            // Ctrl+[ / Cmd+[ — outdent, mirror of the above.
            "Mod-[": () => (findListAncestor(editor) ? editor.commands.listOutdent() : editor.commands.decreaseIndent())
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

                        // Check if cursor is in a list item
                        if (editor.isActive("listItem")) {
                            // In list item - use structural nesting commands
                            event.preventDefault();
                            event.stopPropagation();

                            const result = event.shiftKey
                                ? editor.commands.liftListItem("listItem")
                                : editor.commands.sinkListItem("listItem");

                            return result;
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

/**
 * Finds the nearest list ancestor (bulletList/orderedList/taskList) of the current
 * selection, returning its node and document position, or null if none.
 */
function findListAncestor(editor: Editor): { node: ProseMirrorNode; pos: number } | null {
    const { $from } = editor.state.selection;

    for (let depth = $from.depth; depth > 0; depth--) {
        const node = $from.node(depth);
        if (LIST_TYPES.includes(node.type.name)) {
            return { node, pos: $from.before(depth) };
        }
    }

    return null;
}

/**
 * Applies margin indentation to the nearest list ancestor node only (Approach A).
 * The inner paragraph is never touched, so no double indentation occurs.
 */
function setListMargin(
    editor: Editor,
    tr: Transaction,
    options: IndentOptions,
    dispatch: ((tr: Transaction) => void) | undefined,
    direction: "increase" | "decrease"
): boolean {
    const list = findListAncestor(editor);
    if (!list) {
        return false;
    }

    const currentIndent = list.node.attrs.indent || 0;
    const newIndent =
        direction === "increase"
            ? Math.min(currentIndent + options.indentStep, options.maxIndent)
            : Math.max(currentIndent - options.indentStep, options.minIndent);

    if (newIndent === currentIndent) {
        return false;
    }

    if (dispatch) {
        tr.setNodeMarkup(list.pos, undefined, {
            ...list.node.attrs,
            indent: newIndent
        });
        dispatch(tr);
        return true;
    }

    return false;
}

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
