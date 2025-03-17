import { createElement, ReactElement, useCallback } from "react";
import { useFullscreen } from "../../utils/EditorContext";
import { ToolbarButton } from "./ToolbarWrapper";

export function FullscreenButton(): ReactElement {
    const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();

    const handleClick = useCallback(() => {
        if (isFullscreen) {
            exitFullscreen();
        } else {
            enterFullscreen();
        }
    }, [isFullscreen, enterFullscreen, exitFullscreen]);

    return <ToolbarButton className={"icons icon-Expand"} title={"fullscreen"} onClick={handleClick} />;
}
