import classNames from "classnames";
import { UseComboboxPropGetters } from "downshift/typings";
import { ReactElement, createElement } from "react";
import { Checkbox } from "../../assets/icons";
import { MultiSelector } from "../../helpers/types";
import { ComboboxMenuWrapper } from "../ComboboxWrapper";

interface MultiSelectionMenuProps extends Partial<UseComboboxPropGetters<any>> {
    isOpen: boolean;
    selectableItems: string[];
    selectedItems: string[];
    highlightedIndex: number | null;
    selector: MultiSelector;
    setSelectedItems: (v: string[]) => void;
    placeholderText?: string | null;
}

export function MultiSelectionMenu({
    isOpen,
    getMenuProps,
    getItemProps,
    highlightedIndex,
    selector,
    selectableItems,
    placeholderText
}: MultiSelectionMenuProps): ReactElement {
    return (
        <ComboboxMenuWrapper
            isOpen={isOpen}
            isEmpty={selectableItems.length <= 0}
            getMenuProps={getMenuProps}
            placeholderText={placeholderText}
        >
            {selectableItems.map((item, index) => {
                const isActive = highlightedIndex === index;
                const isSelected = selector.currentValue?.includes(item);
                const itemProps = getItemProps?.({
                    item,
                    index
                });
                return (
                    <li
                        className={classNames("widget-combobox-item", {
                            "widget-combobox-item-highlighted": isSelected || isActive
                        })}
                        key={item}
                        {...itemProps}
                        aria-selected={isSelected}
                    >
                        <Checkbox checked={selector.currentValue?.includes(item)} />
                        {selector.caption.render(item)}
                    </li>
                );
            })}
        </ComboboxMenuWrapper>
    );
}
