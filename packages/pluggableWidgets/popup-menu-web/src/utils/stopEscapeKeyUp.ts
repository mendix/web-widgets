/**
 * Stops the keyup of an Escape the menu has handled, so page-level handlers don't act on it too.
 * Mendix closes pop-up pages on the Escape keyup, so stopping the keydown alone isn't enough.
 */
export function stopEscapeKeyUp(): void {
    const onKeyUp = (e: KeyboardEvent): void => {
        if (e.key === "Escape") {
            e.stopPropagation();
            cleanup();
        }
    };
    // The keyup never reaches the document if the window loses focus first.
    const cleanup = (): void => {
        document.removeEventListener("keyup", onKeyUp, true);
        window.removeEventListener("blur", cleanup);
    };
    document.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("blur", cleanup);
}
