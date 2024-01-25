import { useEventCallback } from "@mendix/widget-plugin-hooks/useEventCallback";
import { createElement, ReactElement, useCallback, useEffect, useRef, useState, MouseEvent, TouchEvent } from "react";

export interface ColumnResizerProps {
    minWidth?: number;
    setColumnWidth: (width: number) => void;
    onResizeEnds?: () => void;
    onResizeStart?: () => void;
}

export function ColumnResizer({
    minWidth = 50,
    setColumnWidth,
    onResizeEnds,
    onResizeStart
}: ColumnResizerProps): ReactElement {
    const [isResizing, setIsResizing] = useState(false);
    const [startPosition, setStartPosition] = useState(0);
    const [currentWidth, setCurrentWidth] = useState(0);
    const resizerReference = useRef<HTMLDivElement>(null);
    const onStart = useEventCallback(onResizeStart);

    const onStartDrag = useCallback(
        (e: TouchEvent<HTMLDivElement> & MouseEvent<HTMLDivElement>): void => {
            const mouseX = e.touches ? e.touches[0].screenX : e.screenX;
            setStartPosition(mouseX);
            setIsResizing(true);
            if (resizerReference.current) {
                const column = resizerReference.current.parentElement!;
                setCurrentWidth(column.clientWidth);
            }
            onStart();
        },
        [onStart]
    );
    const onEndDrag = useCallback((): void => {
        if (!isResizing) {
            return;
        }
        setIsResizing(false);
        setCurrentWidth(0);
        onResizeEnds?.();
    }, [onResizeEnds, isResizing]);
    const setColumnWidthStable = useEventCallback(setColumnWidth);
    const onMouseMove = useCallback(
        (e: TouchEvent & MouseEvent & Event): void => {
            if (!isResizing) {
                return;
            }
            const mouseX = e.touches ? e.touches[0].screenX : e.screenX;

            if (currentWidth) {
                const moveDifference = startPosition - mouseX;
                let newWidth = currentWidth - moveDifference;
                if (newWidth < minWidth) {
                    newWidth = minWidth;
                }
                setColumnWidthStable(newWidth);
            }
        },
        [isResizing, currentWidth, startPosition, minWidth, setColumnWidthStable]
    );

    useEffect(() => {
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onEndDrag);

        document.addEventListener("touchmove", onMouseMove);
        document.addEventListener("touchend", onEndDrag);
        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onEndDrag);

            document.removeEventListener("touchmove", onMouseMove);
            document.removeEventListener("touchend", onEndDrag);
        };
    }, [onMouseMove, onEndDrag]);

    return (
        <div
            aria-hidden
            ref={resizerReference}
            className="column-resizer"
            onMouseDown={onStartDrag}
            onTouchStart={onStartDrag}
        >
            <div className="column-resizer-bar" />
        </div>
    );
}
