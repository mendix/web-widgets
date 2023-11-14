import { usePositionObserver } from "@mendix/widget-plugin-hooks/usePositionObserver";

type PositionType = {
    bottom?: number | undefined;
    left?: number | undefined;
};

export function useMenuPlacement(menuRef: HTMLDivElement | null, isOpen: boolean): PositionType | null {
    const observer = usePositionObserver(menuRef?.parentElement || null, isOpen);
    const comboboxMenuRect = menuRef?.getBoundingClientRect();
    if (menuRef && observer && comboboxMenuRect && comboboxMenuRect.height !== 0) {
        const spaceBetween = window.innerHeight - observer.y;
        console.log(comboboxMenuRect);

        if (spaceBetween < comboboxMenuRect.height) {
            return { bottom: observer.top - comboboxMenuRect.height - 4, left: observer.left }; // 4 is for bottom margin
        }
        return { bottom: observer.bottom, left: observer.left };
    }
    return null;
}
