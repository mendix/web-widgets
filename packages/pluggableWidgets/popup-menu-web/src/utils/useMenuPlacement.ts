import { usePositionObserver } from "@mendix/pluggable-widgets-commons/dist/components/web";
import { CSSProperties } from "react";
import { PositionEnum } from "../../typings/PopupMenuProps";

export function useMenuPlacement(anchorElement: HTMLElement | null, position: PositionEnum): CSSProperties | undefined {
    const triggerPosition = usePositionObserver(anchorElement, true);
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

    return { ...popupStyles, zIndex: 0, position: "fixed", display: "flex" };
}
