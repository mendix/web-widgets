import { RefObject, useEffect, useState, useRef } from "react";
import { usePositionObserver } from "@mendix/widget-plugin-hooks/usePositionObserver";

type PositionType = {
    bottom?: number | undefined;
    left?: number | undefined;
};

export function useMenuPlacement(menuRef: RefObject<HTMLDivElement>, isOpen: boolean): PositionType {
    const observer = usePositionObserver(menuRef.current?.parentElement || null, true);
    const [flip, setFlip] = useState(false);
    const comboboxMenuRect = useRef<DOMRect>();

    useEffect(() => {
        if (menuRef.current) {
            comboboxMenuRect.current = menuRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - comboboxMenuRect.current.bottom;
            if (spaceBelow < 0) {
                setFlip(true);
            }
        }
    }, [observer, menuRef, isOpen]);

    return flip && observer && comboboxMenuRect.current
        ? { bottom: observer.top - comboboxMenuRect.current.height - 4, left: observer.left } // 4 is for bottom margin
        : {
              bottom: observer?.bottom,
              left: observer?.left
          };
}
