import { UseComboboxPropGetters } from "downshift/typings";
import { createElement, ReactElement } from "react";
import { SingleSelector } from "../../helpers/types";
import { ComboboxMenuWrapper } from "../ComboboxMenuWrapper";
import { ComboboxOptionWrapper } from "../ComboboxOptionWrapper";

interface ComboboxMenuProps extends Partial<UseComboboxPropGetters<string>> {
    isOpen: boolean;
    selector: SingleSelector;
    highlightedIndex: number | null;
    selectedItem?: string | null;
    noOptionsText?: string;
}

export function SingleSelectionMenu({
    isOpen,
    selector,
    highlightedIndex,
    getMenuProps,
    getItemProps,
    noOptionsText
}: ComboboxMenuProps): ReactElement {
    const items = selector.options.getAll();
    return (
        <ComboboxMenuWrapper
            isOpen={isOpen}
            isEmpty={items.length <= 0}
            getMenuProps={getMenuProps}
            noOptionsText={noOptionsText}
        >
            {isOpen &&
                items.map((item, index) => (
                    <ComboboxOptionWrapper
                        key={item}
                        isHighlighted={highlightedIndex === index}
                        isSelected={selector.currentValue === item}
                        item={item}
                        getItemProps={getItemProps}
                        index={index}
                    >
                        {selector.caption.render(item)}
                    </ComboboxOptionWrapper>
                ))}
        </ComboboxMenuWrapper>
    );
}
