import { UseComboboxPropGetters } from "downshift/typings";
import { createElement, MouseEvent, ReactElement, ReactNode } from "react";
import { Checkbox } from "../../assets/icons";
import { MultiSelector } from "../../helpers/types";
import { useLazyLoading } from "../../hooks/useLazyLoading";
import { ComboboxMenuWrapper } from "../ComboboxMenuWrapper";
import { ComboboxOptionWrapper } from "../ComboboxOptionWrapper";
import { Loader } from "../Loader";

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
    const lazyLoading = selector.lazyLoading ?? false;
    const { isLoading, onScroll } = useLazyLoading({
        hasMoreItems: selector.options.hasMore ?? false,
        isInfinite: lazyLoading,
        isOpen,
        loadMore: () => {
            if (selector.options.loadMore) {
                selector.options.loadMore();
            }
        },
        numberOfItems: selectableItems.length
    });

    return (
        <ComboboxMenuWrapper
            getMenuProps={getMenuProps}
            highlightedIndex={highlightedIndex}
            isEmpty={selectableItems.length <= 0}
            isOpen={isOpen}
            lazyLoading={lazyLoading}
            loader={
                <Loader
                    isLoading={isLoading}
                    isOpen={isOpen}
                    lazyLoading={lazyLoading}
                    loadingType={selector.loadingType}
                    withCheckbox={selector.selectionMethod === "checkbox"}
                />
            }
            menuFooterContent={menuFooterContent}
            menuHeaderContent={menuHeaderContent}
            noOptionsText={noOptionsText}
            onOptionClick={onOptionClick}
            onScroll={lazyLoading ? onScroll : undefined}
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
