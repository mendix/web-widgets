import { UseComboboxPropGetters } from "downshift/typings";
import { createElement, ReactElement, ReactNode, useCallback } from "react";
import { SingleSelector } from "../../helpers/types";
import { ComboboxMenuWrapper } from "../ComboboxMenuWrapper";
import { ComboboxOptionWrapper } from "../ComboboxOptionWrapper";

interface ComboboxMenuProps extends Partial<UseComboboxPropGetters<string>> {
    isOpen: boolean;
    selector: SingleSelector;
    highlightedIndex: number | null;
    selectedItem?: string | null;
    noOptionsText?: string;
    alwaysOpen?: boolean;
    menuFooterContent?: ReactNode;
}

export function SingleSelectionMenu({
    isOpen,
    selector,
    highlightedIndex,
    getMenuProps,
    getItemProps,
    noOptionsText,
    alwaysOpen,
    menuFooterContent
}: ComboboxMenuProps): ReactElement {
    const items = selector.options.getAll();
    const setPage = useCallback(() => {
        if (selector.options.loadMore) {
            selector.options.loadMore();
        }
    }, [selector.options]);

    return (
        <ComboboxMenuWrapper
            isOpen={isOpen}
            isEmpty={items?.length <= 0}
            getMenuProps={getMenuProps}
            noOptionsText={noOptionsText}
            menuFooterContent={menuFooterContent}
            alwaysOpen={alwaysOpen}
            hasMoreItems={selector.options.hasMore ?? false}
            isInfinite={selector.lazyLoading ?? false}
            setPage={setPage}
        >
            {isOpen &&
                items.map((item, index) => (
                    <ComboboxOptionWrapper
                        key={item}
                        isHighlighted={alwaysOpen ? false : highlightedIndex === index}
                        isSelected={selector.currentId === item}
                        item={item}
                        getItemProps={getItemProps}
                        index={index}
                    >
                        {selector.caption.render(item, "options")}
                    </ComboboxOptionWrapper>
                ))}
        </ComboboxMenuWrapper>
    );
}
