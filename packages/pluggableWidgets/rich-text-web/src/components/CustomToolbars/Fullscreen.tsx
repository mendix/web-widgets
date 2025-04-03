import { createElement, ReactElement, useCallback, useContext } from "react";
import { ToolbarButton } from "./ToolbarWrapper";
import { CustomToolbarProps } from "./customToolbars";
import { ACTION_DISPATCHER } from "../../utils/helpers";
import { SET_FULLSCREEN_ACTION } from "../../store/store";
import { EditorContext } from "../../store/EditorProvider";
import classNames from "classnames";

export function FullscreenButton({ quill }: CustomToolbarProps): ReactElement {
    const handleClick = useCallback(() => {
        quill?.emitter.emit(ACTION_DISPATCHER, { type: SET_FULLSCREEN_ACTION });
    }, [quill]);

    const { isFullscreen } = useContext(EditorContext);

    return (
        <ToolbarButton
            className={classNames(`icons icon-Expand`, { "ql-active": isFullscreen })}
            title={"Fullscreen"}
            onClick={handleClick}
        />
    );
}
