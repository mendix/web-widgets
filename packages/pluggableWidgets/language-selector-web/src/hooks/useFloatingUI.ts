import {
    autoUpdate,
    flip,
    offset,
    Placement,
    ReferenceElement,
    safePolygon,
    useClick,
    useDismiss,
    useFloating,
    UseFloatingReturn,
    useHover,
    useInteractions,
    useListNavigation,
    useRole,
    useTypeahead
} from "@floating-ui/react";
import { MutableRefObject, useRef, useState } from "react";
import { TriggerEnum } from "../../typings/LanguageSelectorProps";
import { LanguageItem } from "src/LanguageSelector";

interface FloatingProps {
    currentLanguage?: LanguageItem;
    isOpen: boolean;
    languageList: LanguageItem[];
    onSelect?: (lang: LanguageItem) => void;
    position: Placement;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    triggerOn: TriggerEnum;
}

interface InternalFloatingProps {
    activeIndex: number | null;
    handleSelect: (index: number) => void;
    isTypingRef: MutableRefObject<boolean>;
    listRef: MutableRefObject<Array<HTMLElement | null>>;
    selectedIndex: number | null;
}

type FloatingReturn = Pick<UseFloatingReturn<ReferenceElement>, "context" | "floatingStyles" | "refs">;
type UseInteractionsReturn = ReturnType<typeof useInteractions>;

type FloatingPropsReturn = Partial<FloatingReturn> & InternalFloatingProps & Partial<UseInteractionsReturn>;

export function useFloatingUI({
    currentLanguage,
    isOpen,
    languageList,
    onSelect,
    position,
    setOpen,
    triggerOn
}: FloatingProps): FloatingPropsReturn {
    const options = languageList.map(item => item.value);
    const index = languageList.findIndex(item => item.value === currentLanguage?.value);

    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(index ?? null);

    const { context, floatingStyles, refs } = useFloating<HTMLElement>({
        onOpenChange: setOpen,
        open: isOpen,
        placement: position,
        strategy: "fixed",
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(2),
            flip({
                fallbackPlacements: ["top", "right", "bottom", "left"]
            })
        ]
    });

    const listRef = useRef<Array<HTMLElement | null>>([]);
    const listContentRef = useRef(options);
    const isTypingRef = useRef(false);

    const hover = useHover(context, {
        enabled: triggerOn === "hover",
        move: false,
        handleClose: safePolygon()
    });
    const click = useClick(context, { enabled: triggerOn === "click", event: "mousedown" });
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: "listbox" });
    const listNav = useListNavigation(context, {
        listRef,
        activeIndex,
        selectedIndex,
        onNavigate: setActiveIndex
    });
    const typeahead = useTypeahead(context, {
        listRef: listContentRef,
        activeIndex,
        selectedIndex,
        onMatch: isOpen ? setActiveIndex : setSelectedIndex,
        onTypingChange(isTyping) {
            isTypingRef.current = isTyping;
        }
    });

    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
        dismiss,
        role,
        listNav,
        typeahead,
        click,
        hover
    ]);

    const handleSelect = (index: number): void => {
        onSelect?.(languageList[index]);
        setSelectedIndex(index);
        setOpen(false);
    };

    return {
        activeIndex,
        context,
        floatingStyles,
        getFloatingProps,
        getItemProps,
        getReferenceProps,
        handleSelect,
        isTypingRef,
        listRef,
        refs,
        selectedIndex
    };
}
