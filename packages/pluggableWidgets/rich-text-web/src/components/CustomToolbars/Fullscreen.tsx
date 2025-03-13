import { createElement, ReactElement, useCallback } from "react";
import { FullscreenIcon } from "src/assets/Icons";
import { CustomToolbarProps } from "./customToolbars";
import { ToolbarButton } from "./ToolbarWrapper";

export function FullscreenButton({ quill }: CustomToolbarProps): ReactElement {
    const onFullscreen = useCallback(() => {
        quill?.container.parentElement?.parentElement?.parentElement?.classList.toggle("fullscreen");
    }, [quill]);

    return (
        <ToolbarButton className="fullscreen-button icons icon-Expand" title="Fullscreen" onClick={onFullscreen}>
            <FullscreenIcon />
        </ToolbarButton>
    );
}
