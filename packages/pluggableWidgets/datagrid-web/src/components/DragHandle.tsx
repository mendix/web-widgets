import { DragEvent, DragEventHandler, MouseEvent, ReactElement } from "react";
import { FaGripVertical } from "./icons/FaGripVertical";

interface DragHandleProps {
    draggable: boolean;
    onDragStart?: DragEventHandler<HTMLSpanElement>;
    onDragEnd?: DragEventHandler<HTMLSpanElement>;
}
export function DragHandle({ draggable, onDragStart, onDragEnd }: DragHandleProps): ReactElement {
    const handleMouseDown = (e: MouseEvent<HTMLSpanElement>): void => {
        // Only stop propagation, don't prevent default - we need default for drag to work
        e.stopPropagation();
    };

    const handleClick = (e: MouseEvent<HTMLSpanElement>): void => {
        // Stop click events from bubbling to prevent sorting
        e.stopPropagation();
        e.preventDefault();
    };

    const handleDragStart = (e: DragEvent<HTMLSpanElement>): void => {
        // Don't stop propagation here - let the drag start properly
        if (onDragStart) {
            onDragStart(e);
        }
    };

    const handleDragEnd = (e: DragEvent<HTMLSpanElement>): void => {
        if (onDragEnd) {
            onDragEnd(e);
        }
    };

    return (
        <span
            className="drag-handle"
            draggable={draggable}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
        >
            <FaGripVertical />
        </span>
    );
}
