import classNames from "classnames";
import { PropGetters } from "downshift/typings";
import { createElement, ReactElement } from "react";
import { SingleSelector } from "../../helpers/types";

interface ComboboxMenuProps extends Partial<PropGetters<any>> {
    isOpen: boolean;
    selector: SingleSelector;
    highlightedIndex: number | null;
    selectedItem?: string | null;
}

export function SingleSelectionMenu({
    isOpen,
    selector,
    highlightedIndex,
    getMenuProps,
    getItemProps
}: ComboboxMenuProps): ReactElement {
    return (
        <ul
            className={classNames("widget-combobox-menu", { "widget-combobox-menu-hidden": !isOpen })}
            {...getMenuProps?.({}, { suppressRefError: true })}
        >
            {isOpen
                ? selector.options.getAll().map((item, index) => (
                      <li
                          className={classNames("widget-combobox-item", {
                              "widget-combobox-item-selected": selector.currentValue === item,
                              "widget-combobox-item-highlighted": highlightedIndex === index
                          })}
                          key={item}
                          {...getItemProps?.({
                              key: item,
                              index,
                              item
                          })}
                      >
                          {selector.caption.render(item)}
                      </li>
                  ))
                : null}
        </ul>
    );
}
