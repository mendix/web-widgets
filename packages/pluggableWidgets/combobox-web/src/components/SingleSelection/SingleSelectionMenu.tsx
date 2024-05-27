import { UseComboboxPropGetters } from "downshift/typings";
import { createElement, ReactElement, ReactNode } from "react";
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

    return (
        <ComboboxMenuWrapper
            alwaysOpen={alwaysOpen}
            getMenuProps={getMenuProps}
            hasMoreItems={selector.options.hasMore ?? false}
            isEmpty={items?.length <= 0}
            isInfinite={selector.lazyLoading ?? false}
            isOpen={isOpen}
            loadingType={selector.loadingType}
            menuFooterContent={menuFooterContent}
            noOptionsText={noOptionsText}
            numberOfItems={items.length}
            setPage={() => {
                if (selector.options.loadMore) {
                    selector.options.loadMore();
                }
            }}
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
