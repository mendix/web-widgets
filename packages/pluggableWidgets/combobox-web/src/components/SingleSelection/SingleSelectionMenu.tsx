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
    showFooter: boolean;
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
    showFooter,
    menuFooterContent
}: ComboboxMenuProps): ReactElement {
    const items = selector.options.getAll();

    return (
        <ComboboxMenuWrapper
            isOpen={isOpen}
            isEmpty={items?.length <= 0}
            getMenuProps={getMenuProps}
            noOptionsText={noOptionsText}
            showFooter={showFooter}
            menuFooterContent={menuFooterContent}
            alwaysOpen={alwaysOpen}
        >
            {isOpen &&
                items.map((item, index) => (
                    <ComboboxOptionWrapper
                        key={item}
                        isHighlighted={alwaysOpen ? false : highlightedIndex === index}
                        isSelected={selector.currentValue === item}
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
