import { MutableRefObject, useCallback, useRef } from "react";

/**
 * Tells a focus event caused by a mouse press apart from keyboard focus.
 * Focus is the default action of mousedown, so it happens before the timeout resets the flag.
 */
export function useMouseDownRef(): [MutableRefObject<boolean>, () => void] {
    const mouseDownRef = useRef(false);
    const onMouseDown = useCallback(() => {
        mouseDownRef.current = true;
        setTimeout(() => {
            mouseDownRef.current = false;
        });
    }, []);
    return [mouseDownRef, onMouseDown];
}
