import { useEventCallback } from "@mendix/widget-plugin-hooks/useEventCallback";
import { MouseEvent, ReactElement, TouchEvent, useCallback, useEffect, useRef, useState } from "react";
import { useColumn, useColumnsStore } from "../model/hooks/injection-hooks";

export interface ColumnResizerProps {
    minWidth?: number;
}

export function ColumnResizer({ minWidth = 50 }: ColumnResizerProps): ReactElement {
    const column = useColumn();
    const columnsStore = useColumnsStore();
    const [isResizing, setIsResizing] = useState(false);
    const [startPosition, setStartPosition] = useState(0);
    const [currentWidth, setCurrentWidth] = useState(0);
    const resizerReference = useRef<HTMLDivElement>(null);

    const onStartDrag = useCallback(
        (e: TouchEvent<HTMLDivElement> & MouseEvent<HTMLDivElement>): void => {
            const mouseX = e.touches ? e.touches[0].screenX : e.screenX;
            setStartPosition(mouseX);
            setIsResizing(true);
            if (resizerReference.current) {
                const columnElement = resizerReference.current.parentElement!;
                setCurrentWidth(columnElement.offsetWidth);
            }
            columnsStore.setIsResizing(true);
        },
        [columnsStore]
    );
    const onEndDrag = useCallback((): void => {
        if (!isResizing) {
            return;
        }
        setIsResizing(false);
        setCurrentWidth(0);
        columnsStore.setIsResizing(false);
    }, [columnsStore, isResizing]);
    const setColumnWidthStable = useEventCallback((width: number) => column.setSize(width));
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
