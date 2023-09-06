import { usePositionObserver } from "@mendix/widget-plugin-hooks/usePositionObserver";
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
                  left: 0,
                  top: triggerPosition.height,
                  transform: "none",
                  bottom: "initial"
              }
            : position === "right"
            ? {
                  top: 0,
                  left: triggerPosition.width,
                  transform: "none",
                  right: "initial"
              }
            : { top: 0, left: 0 };

    return { ...popupStyles, zIndex: 1, position: "absolute", display: "flex" };
}
