import classNames from "classnames";
import { UseComboboxPropGetters } from "downshift/typings";
import { createElement, ReactElement } from "react";
import { SingleSelector } from "../../helpers/types";
import { ComboboxMenuWrapper } from "../ComboboxWrapper";

interface ComboboxMenuProps extends Partial<UseComboboxPropGetters<any>> {
    isOpen: boolean;
    selector: SingleSelector;
    highlightedIndex: number | null;
    selectedItem?: string | null;
    placeholderText?: string | null;
}

export function SingleSelectionMenu({
    isOpen,
    selector,
    highlightedIndex,
    getMenuProps,
    getItemProps,
    placeholderText
}: ComboboxMenuProps): ReactElement {
    const items = selector.options.getAll();
    return (
        <ComboboxMenuWrapper
            isOpen={isOpen}
            isEmpty={items.length <= 0}
            getMenuProps={getMenuProps}
            placeholderText={placeholderText}
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
