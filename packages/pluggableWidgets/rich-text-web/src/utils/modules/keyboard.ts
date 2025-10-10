import {
    addIndentText,
    enterKeyKeyboardHandler,
    exitFullscreenKeyboardHandler,
    gotoStatusBarKeyboardHandler,
    gotoToolbarKeyboardHandler
} from "./toolbarHandlers";
import QuillTableBetter from "../formats/quill-table-better/quill-table-better";

export function getKeyboardBindings(): Record<string, unknown> {
    const defaultBindings: Record<string, unknown> = {
        enter: {
            key: "Enter",
            handler: enterKeyKeyboardHandler
        },
        focusTab: {
            key: "F10",
            altKey: true,
            handler: gotoToolbarKeyboardHandler
        },
        shiftTab: {
            key: "Tab",
            shiftKey: true,
            handler: gotoToolbarKeyboardHandler
        },
        nextFocusTab: {
            key: "F11",
            altKey: true,
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
