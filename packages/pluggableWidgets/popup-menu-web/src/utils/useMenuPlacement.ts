import { usePositionObserver } from "@mendix/pluggable-widgets-commons/dist/components/web";
import { CSSProperties } from "react";
import { PositionEnum } from "../../typings/PopupMenuProps";

export function useMenuPlacement(anchorElement: HTMLElement | null, position: PositionEnum): CSSProperties | undefined {
    const triggerPosition = usePositionObserver(anchorElement, true);

    const overlayElement = document.getElementsByClassName("modal-dialog")[0] as HTMLElement; // Making sure to get a zIndex higher if a "modal-dialog" exists.
    const overlayZIndex = overlayElement?.style?.zIndex ?? "";
    const calculatedZIndex = overlayZIndex ? parseInt(overlayZIndex, 10) + 1 : 0;

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

    return { ...popupStyles, zIndex: calculatedZIndex, position: "fixed", display: "flex" };
}
