import { useEffect } from "react";

export function useHandleOnClickOutsideElement(ref: HTMLElement | null, handler: () => void): void {
    useEffect(() => {
        const listener = (event: MouseEvent & { target: Node | null }): void => {
            if (!ref || ref.contains(event.target)) {
                return;
            }
            handler();
        };
        ref?.ownerDocument.addEventListener("mousedown", listener);
        ref?.ownerDocument.addEventListener("touchstart", listener);
        return () => {
            ref?.ownerDocument.removeEventListener("mousedown", listener);
            ref?.ownerDocument.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
}
