import { ReactElement } from "react";
import { FaGripVertical } from "./icons/FaGripVertical";

/**
 * Visual-only drag handle.
 *
 * For preview purposes only; does not implement drag-and-drop functionality.
 */
export function DragHandleIcon(): ReactElement {
    return (
        <span className="drag-handle" aria-hidden="true">
            <FaGripVertical />
        </span>
    );
}
