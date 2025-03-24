import { createElement, ReactElement, useCallback } from "react";
import { ToolbarButton } from "./ToolbarWrapper";
import { CustomToolbarProps } from "./customToolbars";
import { ACTION_DISPATCHER } from "../../utils/helpers";
import { SET_FULLSCREEN_ACTION } from "../../store/store";

export function FullscreenButton({ quill }: CustomToolbarProps): ReactElement {
    const handleClick = useCallback(() => {
        quill?.emitter.emit(ACTION_DISPATCHER, { type: SET_FULLSCREEN_ACTION });
    }, [quill]);

    return <ToolbarButton className={"icons icon-Expand"} title={"fullscreen"} onClick={handleClick} />;
}
