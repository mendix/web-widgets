import { UseComboboxPropGetters } from "downshift/typings";
import { createElement, MouseEvent, ReactElement, ReactNode, useCallback } from "react";
import { Checkbox } from "../../assets/icons";
import { MultiSelector } from "../../helpers/types";
import { ComboboxMenuWrapper } from "../ComboboxMenuWrapper";
import { ComboboxOptionWrapper } from "../ComboboxOptionWrapper";

interface MultiSelectionMenuProps extends Partial<UseComboboxPropGetters<string>> {
    isOpen: boolean;
    selectableItems: string[];
    selectedItems: string[];
    highlightedIndex: number | null;
    selector: MultiSelector;
    noOptionsText?: string;
    inputId?: string;
    menuHeaderContent?: ReactNode;
    menuFooterContent?: ReactNode;
    onOptionClick?: (e: MouseEvent) => void;
}

export function MultiSelectionMenu({
    isOpen,
    getMenuProps,
    getItemProps,
    highlightedIndex,
    selector,
    selectableItems,
    noOptionsText,
    inputId,
    menuHeaderContent,
    menuFooterContent,
    onOptionClick
}: MultiSelectionMenuProps): ReactElement {
    const setPage = useCallback(() => {
        if (selector.options.loadMore) {
            selector.options.loadMore();
        }
    }, [selector.options]);

    return (
        <ComboboxMenuWrapper
            isOpen={isOpen}
            isEmpty={selectableItems.length <= 0}
            getMenuProps={getMenuProps}
            noOptionsText={noOptionsText}
            highlightedIndex={highlightedIndex}
            menuHeaderContent={menuHeaderContent}
            menuFooterContent={menuFooterContent}
            onOptionClick={onOptionClick}
            hasMoreItems={selector.options.hasMore ?? false}
            isInfinite={selector.lazyLoading ?? false}
            setPage={setPage}
        >
            {isOpen &&
                selectableItems.map((item, index) => {
                    const isActive = highlightedIndex === index;
                    const isSelected = selector.currentId?.includes(item);

                    return (
                        <ComboboxOptionWrapper
                            key={item}
                            isHighlighted={isActive}
                            isSelected={isSelected}
                            item={item}
                            getItemProps={getItemProps}
                            index={index}
                        >
                            {selector.selectionMethod === "checkbox" && (
                                <Checkbox checked={isSelected} id={`${inputId}_${item}`} />
                            )}
                            {selector.caption.render(item, "options", `${inputId}_${item}`)}
                        </ComboboxOptionWrapper>
                    );
                })}
        </ComboboxMenuWrapper>
    );
}
