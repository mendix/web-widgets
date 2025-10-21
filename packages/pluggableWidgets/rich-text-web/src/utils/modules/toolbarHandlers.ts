import Quill from "quill";
import Delta from "quill-delta";
import { MutableRefObject } from "react";
import { Range } from "quill/core/selection";
import Keyboard, { Context } from "quill/modules/keyboard";
import { Scope } from "parchment";
import { ACTION_DISPATCHER } from "../helpers";
import { SET_FULLSCREEN_ACTION } from "../../store/store";

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

export function shiftEnterKeyKeyboardHandler(this: Keyboard, range: Range, context: Context): any {
    if (context.format.table) {
        return true;
    }
    this.quill.insertEmbed(range.index, "softbreak", true, Quill.sources.USER);
    this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
    return false;
}

export function movePrevFocus(this: Keyboard, range: Range, context: Context): any {
    if (context.format.table || context.format.indent || context.format.list || context.format.blockquote) {
        context.event.stopPropagation();
        context.event.preventDefault();
        return true;
    }

    gotoToolbarKeyboardHandler.call(this, range, context);
}

// focus to first toolbar button
export function gotoToolbarKeyboardHandler(this: Keyboard, _range: Range, context: Context): any {
    if (context.format.table) {
        return true;
    }

    const toolbar = this.quill.container.parentElement?.parentElement?.querySelector(".widget-rich-text-toolbar");
    if (toolbar) {
        (toolbar?.querySelector(".ql-formats button") as HTMLElement)?.focus();
    } else {
        this.quill.blur();
    }
}

// move to next element focus : status bar button (exit editor)
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

// default quill tab handler
// https://github.com/slab/quill/blob/539cbffd0a13b18e9c65eb84dd35e6596e403158/packages/quill/src/modules/keyboard.ts#L412
// but modified to add stopPropagation and preventDefault
export function addIndentText(this: Keyboard, range: Range, context: Context): boolean | void {
    if (context.format.table) {
        return true;
    }
    this.quill.history.cutoff();
    const delta = new Delta().retain(range.index).delete(range.length).insert("\t");
    this.quill.updateContents(delta, Quill.sources.USER);
    this.quill.history.cutoff();
    this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
    context.event.stopPropagation();
    context.event.preventDefault();
    return false;
}

/**
 * Keyboard handler for exiting fullscreen mode when the Escape key is pressed
 */
export function exitFullscreenKeyboardHandler(this: Keyboard, _range: Range, _context: Context): boolean | void {
    this.quill.emitter.emit(ACTION_DISPATCHER, { type: SET_FULLSCREEN_ACTION, value: false });
    return true;
}
