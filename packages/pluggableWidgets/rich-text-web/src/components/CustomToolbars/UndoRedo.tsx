import { ReactElement, createElement, useCallback } from "react";
import { ToolbarButton } from "./ToolbarWrapper";
import type { CustomToolbarProps } from "./customToolbars";

export function UndoToolbar({ quill }: CustomToolbarProps): ReactElement {
    const onUndo = useCallback(() => {
        quill?.history.undo();
    }, [quill]);

    return <ToolbarButton className="mx-icon-filled mx-icon-undo" onClick={onUndo}></ToolbarButton>;
}

export function RedoToolbar({ quill }: CustomToolbarProps): ReactElement {
    const onRedo = useCallback(() => {
        quill?.history.redo();
    }, [quill]);

    return <ToolbarButton className="mx-icon-filled mx-icon-redo" onClick={onRedo}></ToolbarButton>;
}
