import { usePositionObserver } from "@mendix/pluggable-widgets-commons/dist/components/web";
import { CSSProperties } from "react";
import { PositionEnum } from "../../typings/PopupMenuProps";

export function useMenuPlacement(anchorElement: HTMLElement | null, position: PositionEnum) {
    const triggerPosition = usePositionObserver(anchorElement, true);
    const popupStyles: CSSProperties =
        position === "bottom" && triggerPosition
            ? {
                  position: "fixed",
                  top: triggerPosition.height + triggerPosition.top,
                  left: triggerPosition.left,
                  transform: "none",
                  bottom: "initial"
              }
            : position === "right" && triggerPosition
            ? {
                  position: "fixed",
                  top: triggerPosition.top,
                  left: triggerPosition.left + triggerPosition.width,
                  transform: "none",
                  bottom: "initial"
              }
            : { position: "fixed", top: triggerPosition?.top, left: triggerPosition?.left };
    return popupStyles;
}
