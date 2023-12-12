import { UseComboboxPropGetters } from "downshift/typings";
import { ReactElement, createElement } from "react";
import { Checkbox, SelectAll } from "../../assets/icons";
import { MultiSelector } from "../../helpers/types";
import { ComboboxMenuWrapper } from "../ComboboxMenuWrapper";
import { ComboboxOptionWrapper } from "../ComboboxOptionWrapper";
import classNames from "classnames";

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
    const availableItems = selector.selectionMethod === "rowclick" ? selector.options.getAll() : selectableItems;
    const allSelected = compareArrays(availableItems, selector.currentValue);
    const handleSelectAll = (event: any): void => {
        event.nativeEvent.preventDownshiftDefault = true;
        if (!allSelected) {
            setSelectedItems(availableItems);
        } else {
            setSelectedItems([]);
        }
    };

    return (
        <ComboboxMenuWrapper
            isOpen={isOpen}
            isEmpty={selectableItems.length <= 0}
            getMenuProps={getMenuProps}
            noOptionsText={noOptionsText}
            selectAllButtonEnabled={selector.selectAllButton}
        >
            {selector.selectAllButton && isOpen && (
                <li
                    className={classNames("widget-combobox-item", {
                        "widget-combobox-item-selected": allSelected,
                        "widget-combobox-item-highlighted": highlightedIndex === selectableItems.length - 1
                    })}
                    {...getItemProps?.({
                        index: selectableItems.length - 1,
                        item: "select-all-btn"
                    })}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            e.stopPropagation();
                            e.preventDefault();
                            handleSelectAll?.(e);
                        }
                    }}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleSelectAll?.(e);
                    }}
                    aria-selected={false}
                >
                    <button
                        className="widget-combobox-menu-header-select-all-button"
                        aria-label={selectAllButtonAriaLabel}
                        tabIndex={-1}
                    >
                        <SelectAll allSelected={allSelected} />
                    </button>
                </li>
            )}
            {isOpen &&
                selectableItems
                    .filter(item => item !== "select-all-btn")
                    .map((item, index) => {
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
