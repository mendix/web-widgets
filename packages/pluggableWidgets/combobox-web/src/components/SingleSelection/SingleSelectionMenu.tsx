import { UseComboboxPropGetters } from "downshift/typings";
import { createElement, ReactElement, ReactNode } from "react";
import { SingleSelector } from "../../helpers/types";
import { useLazyLoading } from "../../hooks/useLazyLoading";
import { ComboboxMenuWrapper } from "../ComboboxMenuWrapper";
import { ComboboxOptionWrapper } from "../ComboboxOptionWrapper";
import { Loader } from "../Loader";

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
        numberOfItems: items.length
    });

    return (
        <ComboboxMenuWrapper
            alwaysOpen={alwaysOpen}
            getMenuProps={getMenuProps}
            isEmpty={items?.length <= 0}
            isOpen={isOpen}
            lazyLoading={lazyLoading}
            loader={
                <Loader
                    isLoading={isLoading}
                    isOpen={isOpen}
                    lazyLoading={lazyLoading}
                    loadingType={selector.loadingType}
                    withCheckbox={false}
                    isEmpty={items.length === 0}
                />
            }
            menuFooterContent={menuFooterContent}
            noOptionsText={noOptionsText}
            onScroll={lazyLoading ? onScroll : undefined}
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
