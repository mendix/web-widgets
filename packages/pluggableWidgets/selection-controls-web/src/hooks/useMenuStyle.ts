import { useState, useEffect, useRef, useMemo } from "react";
import { usePositionObserver } from "@mendix/widget-plugin-hooks/usePositionObserver";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";

export function useMenuStyle<T extends HTMLElement>(isOpen: boolean): [React.RefObject<T>, React.CSSProperties] {
    const ref = useRef<T>(null);
    const [style, setStyle] = useState<React.CSSProperties>({ visibility: "hidden", position: "fixed" });
    const [setStyleDebounced, abort] = useMemo(() => debounce(setStyle, 32), [setStyle]);
    const menuHeight = ref.current?.offsetHeight ?? 0;
    const targetBox = usePositionObserver(ref.current?.parentElement ?? null, isOpen);

    useEffect(() => {
        if (targetBox === undefined || ref.current === null || !isOpen) {
            return;
        }

        setStyleDebounced({
            visibility: "visible",
            position: "fixed",
            width: targetBox.width,
            ...getMenuPosition(targetBox, ref.current.getBoundingClientRect())
        });

        return abort;
    }, [menuHeight, isOpen, targetBox, setStyleDebounced, abort]);

    return [ref, style];
}

function getMenuPosition(targetBox: DOMRect, menuBox: DOMRect): React.CSSProperties {
    const { height } = menuBox;
    const bottomSpace = window.innerHeight - targetBox.bottom;
    const topSpace = targetBox.top - height < 0 ? targetBox.top - height : 0;

    if (bottomSpace < height) {
        return { bottom: window.innerHeight - targetBox.top + topSpace, left: targetBox.left };
    }
    return { top: targetBox.bottom, left: targetBox.left };
}
