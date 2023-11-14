import { usePositionObserver } from "@mendix/widget-plugin-hooks/usePositionObserver";

type PositionType = {
    bottom?: number | undefined;
    left?: number | undefined;
};

export function useMenuPlacement(menuRef: HTMLDivElement | null): PositionType | null {
    const observer = usePositionObserver(menuRef?.parentElement || null, true);
    if (menuRef && observer) {
        const comboboxMenuRect = menuRef.getBoundingClientRect();
        const spaceBetween = window.innerHeight - observer.bottom;
        if (spaceBetween < comboboxMenuRect.height) {
            return { bottom: observer.top - comboboxMenuRect.height - 4, left: observer.left }; // 4 is for bottom margin
        }
        return { bottom: observer.bottom, left: observer.left };
    }
    return null;
}
