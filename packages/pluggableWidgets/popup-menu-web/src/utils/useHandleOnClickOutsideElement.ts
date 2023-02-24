import { useEffect, RefObject } from "react";

export function useHandleOnClickOutsideElement(ref: RefObject<HTMLDivElement>, handler: () => void): void {
    useEffect(() => {
        const listener = (event: MouseEvent & { target: Node | null }): void => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            handler();
        };
        ref.current?.ownerDocument.addEventListener("click", listener);
        ref.current?.ownerDocument.addEventListener("touchstart", listener);
        return () => {
            ref.current?.ownerDocument.removeEventListener("click", listener);
            ref.current?.ownerDocument.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
}
