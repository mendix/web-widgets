/**
 * Static catalog of keyboard shortcuts shown in the help dialog.
 *
 * KEEP IN SYNC MANUALLY. TipTap exposes no runtime API to enumerate active
 * shortcuts, so this list is hand-maintained. Sources:
 *  - TipTap built-ins (StarterKit + marks): bold/italic/underline/strike/code,
 *    super/subscript, blockquote, history.
 *  - Custom extensions in src/extensions/: Indent.ts (Ctrl+] / Ctrl+[),
 *    Fullscreen.ts (Escape), KeyboardNavigation.ts (Alt+F10, Alt+F11, Escape).
 *
 * Keys are displayed generically with "Ctrl" (matches TinyMCE). On macOS the
 * platform maps Ctrl-based combos to Cmd; the labels here stay generic.
 *
 * The `id` field identifies shortcuts owned by this repo's custom extensions so
 * a unit test can assert coverage (drift guard). Built-in combos have no id.
 */

export interface ShortcutEntry {
    /** i18n key for the human-readable action name. */
    labelKey: string;
    /** Key combination, e.g. "Ctrl+B". Not translated. */
    keys: string;
    /** Stable id for shortcuts owned by custom extensions (drift-guard test). */
    id?: string;
}

export interface ShortcutCategory {
    /** i18n key for the category heading. */
    titleKey: string;
    shortcuts: ShortcutEntry[];
}

export const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
    {
        titleKey: "shortcut.category.formatting",
        shortcuts: [
            { labelKey: "shortcut.bold", keys: "Ctrl+B" },
            { labelKey: "shortcut.italic", keys: "Ctrl+I" },
            { labelKey: "shortcut.underline", keys: "Ctrl+U" },
            { labelKey: "shortcut.strikethrough", keys: "Ctrl+Shift+S" },
            { labelKey: "shortcut.inlineCode", keys: "Ctrl+E" },
            { labelKey: "shortcut.superscript", keys: "Ctrl+." },
            { labelKey: "shortcut.subscript", keys: "Ctrl+," }
        ]
    },
    {
        titleKey: "shortcut.category.paragraph",
        shortcuts: [
            { labelKey: "shortcut.blockquote", keys: "Ctrl+Shift+B" },
            { labelKey: "shortcut.bulletList", keys: "Ctrl+Shift+8" },
            { labelKey: "shortcut.orderedList", keys: "Ctrl+Shift+7" },
            { labelKey: "shortcut.increaseIndent", keys: "Ctrl+]", id: "indent.increase" },
            { labelKey: "shortcut.decreaseIndent", keys: "Ctrl+[", id: "indent.decrease" }
        ]
    },
    {
        titleKey: "shortcut.category.history",
        shortcuts: [
            { labelKey: "shortcut.undo", keys: "Ctrl+Z" },
            { labelKey: "shortcut.redo", keys: "Ctrl+Y" }
        ]
    },
    {
        titleKey: "shortcut.category.accessibility",
        shortcuts: [
            { labelKey: "shortcut.focusToolbar", keys: "Alt+F10", id: "nav.focusToolbar" },
            { labelKey: "shortcut.focusStatusBar", keys: "Alt+F11", id: "nav.focusStatusBar" },
            { labelKey: "shortcut.returnToEditor", keys: "Escape", id: "nav.escape" }
        ]
    }
];
