import { useEffect, useRef, useState } from "react";

export function useZIndex(popupElement: HTMLElement | null, parentSelector: string): number | undefined {
    const [zIndex, setZIndex] = useState<number | undefined>(undefined);
    const popupRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        popupRef.current = popupElement;
    }, [popupElement]);

    useEffect(() => {
        const parentElement = document.getElementsByClassName(parentSelector)[0] as HTMLElement;
        const parentZIndex = parentElement ? parentElement.style.zIndex : "";

        const calculatedZIndex = parentZIndex ? parseInt(parentZIndex, 10) + 1 : 0;
        setZIndex(calculatedZIndex);
    }, [parentSelector, popupRef.current]);

    return zIndex;
}
