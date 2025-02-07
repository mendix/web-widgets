import Quill from "quill";
import Delta from "quill-delta";
import { MutableRefObject } from "react";
import { Range } from "quill/core/selection";
import Keyboard, { Context } from "quill/modules/keyboard";
import { Scope } from "parchment";
/**
 * give custom indent handler to use our custom "indent-left" and "indent-right" formats (formats/indent.ts)
 */
export function getIndentHandler(ref: MutableRefObject<Quill | null>): (value: any) => void {
    const customIndentHandler = (value: any): void => {
        const range = ref.current?.getSelection();
        // @ts-expect-error type error expected
        const formats = ref.current?.getFormat(range);
        if (formats) {
            const indent = parseInt((formats.indent as string) || "0", 10);
            if (value === "+1" || value === "-1") {
                let modifier = value === "+1" ? 1 : -1;
                const formatHandler = formats.list
                    ? "indent"
                    : formats.direction === "rtl"
                    ? "indent-right"
                    : "indent-left";
                if (formats.direction === "rtl") {
                    modifier *= -1;
                }
                ref.current?.format(formatHandler, indent + modifier, Quill.sources.USER);
            }
        }
    };

    return customIndentHandler;
}

/**
 * copied with modification from "handleEnter" function in :
 * https://github.com/slab/quill/blob/main/packages/quill/src/modules/keyboard.ts
 */
export function enterKeyKeyboardHandler(this: Keyboard, range: Range, context: Context): any {
    const lineFormats = Object.keys(context.format).reduce((formats: Record<string, unknown>, format) => {
        if (this.quill.scroll.query(format, Scope.BLOCK) && !Array.isArray(context.format[format])) {
            formats[format] = context.format[format];
        }
        return formats;
    }, {});

    const delta = new Delta().retain(range.index).delete(range.length).insert("\n", lineFormats);
    this.quill.updateContents(delta, Quill.sources.USER);
    this.quill.setSelection(range.index + 1, Quill.sources.SILENT);

    /**
     * NOTE: Modified from default handler to maintain format on new line
     * Applies previous formats on the new line. This was dropped in
     * https://github.com/slab/quill/commit/ba5461634caa8e24641b687f2d1a8768abfec640
     */
    Object.keys(context.format).forEach(name => {
        if (lineFormats[name] != null) {
            return;
        }
        if (Array.isArray(context.format[name])) {
            return;
        }
        if (name === "code" || name === "link") {
            return;
        }
        this.quill.format(name, context.format[name], Quill.sources.USER);
    });
}

// focus to first toolbar button
export function gotoToolbarKeyboardHandler(this: Keyboard, _range: Range, _context: Context): void {
    const toolbar = this.quill.container.parentElement?.parentElement?.querySelector(".widget-rich-text-toolbar");
    (toolbar?.querySelector(".ql-formats button") as HTMLElement)?.focus();
}

// focus to status bar button (exit editor)
export function gotoStatusBarKeyboardHandler(this: Keyboard, _range: Range, context: Context): boolean | void {
    if (context.format.table) {
        return true;
    }

    const statusBar = this.quill.container.parentElement?.parentElement?.nextElementSibling;
    if (statusBar) {
        (statusBar as HTMLElement)?.focus();
    } else {
        this.quill.blur();
    }
}
