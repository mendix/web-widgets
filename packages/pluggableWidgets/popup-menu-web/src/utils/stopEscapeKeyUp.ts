/**
 * Stops the keyup of an Escape the menu has handled, so page-level handlers don't act on it too.
 * Mendix closes pop-up pages on the Escape keyup, so stopping the keydown alone isn't enough.
 */
export function stopEscapeKeyUp(): void {
    const onKeyUp = (e: KeyboardEvent): void => {
        if (e.key === "Escape") {
            e.stopPropagation();
            document.removeEventListener("keyup", onKeyUp, true);
        }
    };
    document.addEventListener("keyup", onKeyUp, true);
}
