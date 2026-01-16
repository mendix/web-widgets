import { ReactElement } from "react";
import { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { FaGripVertical } from "./icons/FaGripVertical";

interface DragHandleProps {
    setActivatorNodeRef: (element: HTMLElement | null) => void;
    listeners?: DraggableSyntheticListeners;
    attributes?: DraggableAttributes;
}
export function DragHandle({ setActivatorNodeRef, listeners, attributes }: DragHandleProps): ReactElement {
    return (
        <span
            className="drag-handle"
            ref={setActivatorNodeRef}
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
        >
            <FaGripVertical />
        </span>
    );
}
