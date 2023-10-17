import { UseComboboxPropGetters } from "downshift/typings";
import { ReactElement, createElement } from "react";
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
    setSelectedItems: (v: string[]) => void;
    noOptionsText?: string;
}

export function MultiSelectionMenu({
    isOpen,
    getMenuProps,
    getItemProps,
    highlightedIndex,
    selector,
    selectableItems,
    noOptionsText
}: MultiSelectionMenuProps): ReactElement {
    return (
        <ComboboxMenuWrapper
            isOpen={isOpen}
            isEmpty={selectableItems.length <= 0}
            getMenuProps={getMenuProps}
            noOptionsText={noOptionsText}
        >
            {isOpen &&
                selectableItems.map((item, index) => {
                    const isActive = highlightedIndex === index;
                    const isSelected = selector.currentValue?.includes(item);
                    return (
                        <ComboboxOptionWrapper
                            key={item}
                            isHighlighted={isActive}
                            isSelected={isSelected}
                            item={item}
                            getItemProps={getItemProps}
                            index={index}
                        >
                            <Checkbox checked={isSelected} />
                            {selector.caption.render(item, "options")}
                        </ComboboxOptionWrapper>
                    );
                })}
        </ComboboxMenuWrapper>
    );
}
