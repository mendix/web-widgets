import { RefObject, useEffect, useState } from "react";
import { usePositionObserver } from "@mendix/widget-plugin-hooks/usePositionObserver";

type PositionType = {
    bottom?: number | undefined;
    left?: number | undefined;
};

export function useMenuPlacement(menuRef: RefObject<HTMLDivElement>, isOpen: boolean): PositionType | undefined {
    const observer = usePositionObserver(menuRef.current?.parentElement || null, isOpen);
    const [position, setPosition] = useState<PositionType | undefined>({
        bottom: observer?.bottom,
        left: observer?.left
    });

    useEffect(() => {
        if (menuRef.current && observer) {
            const menuRect = menuRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - menuRect.bottom;
            if (spaceBelow < 0) {
                setPosition({ bottom: observer.top - menuRect.height - 4, left: observer.left }); // 4 is for margin at the bottom
            }
        }
    }, [observer, isOpen, menuRef]);

    return position;
}

// Also another logic with flipping a bool state to decide the position

// export function useMenuPlacement(menuRef: RefObject<HTMLDivElement>, isOpen: boolean): PositionType | undefined {
//     const observer = usePositionObserver(menuRef.current?.parentElement || null, isOpen);
//     const [flip, setFlip] = useState(false);
//     const menuRect = useRef<DOMRect>();

//     useEffect(() => {
//         if (menuRef.current && observer) {
//             menuRect.current = menuRef.current.getBoundingClientRect();
//             const spaceBelow = window.innerHeight - menuRect.current.bottom;
//             if (spaceBelow < 0) {
//                 setFlip(true);
//             }
//         }
//         return () => {
//             setFlip(false);
//         };
//     }, [observer, isOpen, menuRef]);

//     return {
//         bottom: flip && observer && menuRect.current ? observer?.bottom - menuRect.current?.height : observer?.bottom,
//         left: observer?.left
//     };
// }
