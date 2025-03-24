import { createElement, ReactElement, useCallback } from "react";
import { ToolbarButton } from "./ToolbarWrapper";
import { CustomToolbarProps } from "./customToolbars";

export function FullscreenButton({ quill }: CustomToolbarProps): ReactElement {
    const handleClick = useCallback(() => {
        console.log("FullscreenButton handleClick", quill);
        quill?.emitter.emit("ACTION-DISPATCH", "SET_FULLSCREEN");
    }, [quill]);

    return <ToolbarButton className={"icons icon-Expand"} title={"fullscreen"} onClick={handleClick} />;
}
