import {
    addIndentText,
    enterKeyKeyboardHandler,
    exitFullscreenKeyboardHandler,
    gotoStatusBarKeyboardHandler,
    gotoToolbarKeyboardHandler,
    moveIndent,
    moveOutdent,
    movePrevFocus,
    shiftEnterKeyKeyboardHandler
} from "./toolbarHandlers";
import QuillTableBetter from "../formats/quill-table-better/quill-table-better";

export function getKeyboardBindings(): Record<string, unknown> {
    const defaultBindings: Record<string, unknown> = {
        enter: {
            key: "Enter",
            handler: enterKeyKeyboardHandler
        },
        shiftEnter: {
            key: "Enter",
            shiftKey: true,
            collapsed: true,
            handler: shiftEnterKeyKeyboardHandler
        },
        focusTab: {
            key: "F10",
            altKey: true,
            collapsed: true,
            handler: gotoToolbarKeyboardHandler
        },
        shiftTab: {
            key: "Tab",
            shiftKey: true,
            handler: movePrevFocus
        },
        outdent: {
            key: "Tab",
            shiftKey: true,
            format: ["blockquote", "indent", "list"],
            // highlight tab or tab at beginning of list, indent or blockquote
            handler: moveOutdent
        },
        indent: {
            // highlight tab or tab at beginning of list, indent or blockquote
            key: "Tab",
            format: ["blockquote", "indent", "list"],
            handler: moveIndent
        },
        nextFocusTab: {
            key: "F11",
            altKey: true,
            collapsed: true,
            handler: gotoStatusBarKeyboardHandler
        },
        escape: {
            key: "Escape",
            handler: exitFullscreenKeyboardHandler
        },
        tab: {
            key: "Tab",
            handler: addIndentText
        },
        ...QuillTableBetter.keyboardBindings
    };
    return defaultBindings;
}
