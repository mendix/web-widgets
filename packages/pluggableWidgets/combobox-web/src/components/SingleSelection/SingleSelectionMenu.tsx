import classNames from "classnames";
import { UseComboboxPropGetters } from "downshift/typings";
import { createElement, ReactElement } from "react";
import { SingleSelector } from "../../helpers/types";
import { ComboboxMenuWrapper } from "../ComboboxMenuWrapper";

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
            {items.map((item, index) => (
                <li
                    className={classNames("widget-combobox-item", {
                        "widget-combobox-item-selected": selector.currentValue === item,
                        "widget-combobox-item-highlighted": highlightedIndex === index
                    })}
                    key={item}
                    {...getItemProps?.({
                        index,
                        item
                    })}
                >
                    {selector.caption.render(item)}
                </li>
            ))}
        </ComboboxMenuWrapper>
    );
}
