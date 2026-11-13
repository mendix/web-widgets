const NON_TEXT_INPUT_TYPES = new Set([
    "button",
    "submit",
    "reset",
    "checkbox",
    "radio",
    "image",
    "file",
    "color",
    "range"
]);

/** Whether the element takes typed text or uses Enter/Space natively (text inputs, textarea, select, contenteditable). */
export function isTextEntry(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }
    if (target instanceof HTMLInputElement) {
        return !NON_TEXT_INPUT_TYPES.has(target.type);
    }
    return target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target.isContentEditable;
}
