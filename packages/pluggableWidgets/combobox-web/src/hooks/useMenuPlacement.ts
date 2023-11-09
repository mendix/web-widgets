import { RefObject, useEffect, useState, useRef } from "react";
import { usePositionObserver } from "@mendix/widget-plugin-hooks/usePositionObserver";

type PositionType = {
    bottom?: number | undefined;
    left?: number | undefined;
};

export function useMenuPlacement(menuRef: RefObject<HTMLDivElement>, isOpen: boolean): PositionType | undefined {
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
        // return () => {
        //     setFlip(false);
        // };
    }, [observer, menuRef, isOpen]);

    return flip && observer && comboboxMenuRect.current
        ? { bottom: observer.top - comboboxMenuRect.current.height - 4, left: observer.left }
        : {
              bottom: observer?.bottom,
              left: observer?.left
          };
}
