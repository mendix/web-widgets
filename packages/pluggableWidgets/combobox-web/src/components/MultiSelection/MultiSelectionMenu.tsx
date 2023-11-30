import { UseComboboxPropGetters } from "downshift/typings";
import { ReactElement, createElement } from "react";
import { Checkbox, SelectAll } from "../../assets/icons";
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
    selectAllButtonAriaLabel: string;
    inputId?: string;
}

export function MultiSelectionMenu({
    isOpen,
    getMenuProps,
    getItemProps,
    setSelectedItems,
    highlightedIndex,
    selector,
    selectableItems,
    noOptionsText,
    selectAllButtonAriaLabel,
    inputId
}: MultiSelectionMenuProps): ReactElement {
    const allSelected = compareArrays(selectableItems, selector.currentValue);
    return (
        <ComboboxMenuWrapper
            isOpen={isOpen}
            isEmpty={selectableItems.length <= 0}
            getMenuProps={getMenuProps}
            noOptionsText={noOptionsText}
        >
            {selector.selectAllButton && (
                <div className="widget-combobox-menu-header">
                    <button
                        className="widget-combobox-menu-header-select-all-button"
                        aria-label={selectAllButtonAriaLabel}
                        onClick={e => {
                            e.stopPropagation();
                            if (!allSelected) {
                                setSelectedItems(selectableItems);
                            } else {
                                setSelectedItems([]);
                            }
                        }}
                    >
                        <SelectAll allSelected={allSelected} />
                    </button>
                </div>
            )}
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

const compareArrays = (a: string[] | null, b: string[] | null): boolean | undefined => {
    return a && b ? a.length === b.length && a.every(element => b.includes(element)) : false;
};
