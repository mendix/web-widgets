import { usePositionObserver } from "@mendix/pluggable-widgets-commons/dist/components/web";
import { CSSProperties } from "react";
import { PositionEnum } from "../../typings/PopupMenuProps";
import { useZIndex } from "./useZIndex";

export function useMenuPlacement(anchorElement: HTMLElement | null, position: PositionEnum): CSSProperties | undefined {
    const triggerPosition = usePositionObserver(anchorElement, true);
    const zIndex = useZIndex(anchorElement, "modal-dialog"); // Making sure to get a zIndex higher than "modal-dialog"

    if (!triggerPosition) {
        return undefined;
    }
    const popupStyles: CSSProperties =
        position === "bottom"
            ? {
                  top: triggerPosition.height + triggerPosition.top,
                  left: triggerPosition.left,
                  transform: "none",
                  bottom: "initial"
              }
            : position === "right"
            ? {
                  top: triggerPosition.top,
                  left: triggerPosition.left + triggerPosition.width,
                  transform: "none",
                  bottom: "initial"
              }
            : { top: triggerPosition?.top, left: triggerPosition?.left };

    return { ...popupStyles, zIndex, position: "fixed", display: "flex" };
}
