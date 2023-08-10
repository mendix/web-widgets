import classNames from "classnames";
import { PropGetters } from "downshift/typings";
import { createElement, ReactElement } from "react";
import { SingleSelector } from "../../helpers/types";

interface ComboboxMenuProps extends Partial<PropGetters<any>> {
    comboboxSize: DOMRect | undefined;
    isOpen: boolean;
    selector: SingleSelector;
    highlightedIndex: number | null;
    selectedItem?: string | null;
}

export function SingleSelectionMenu(props: ComboboxMenuProps): ReactElement {
    const { comboboxSize, isOpen, selector, highlightedIndex, getMenuProps, getItemProps } = props;
    return (
        <ul
            className={classNames("widget-combobox-menu", { "widget-combobox-menu-hidden": !isOpen })}
            {...getMenuProps?.({}, { suppressRefError: true })}
            style={{
                width: comboboxSize?.width
            }}
        >
            {isOpen
                ? selector.options.getAll().map((item, index) => (
                      <li
                          className={classNames("widget-combobox-item", {
                              "widget-combobox-item-selected": selector.currentValue === item,
                              "widget-combobox-item-highlighted": highlightedIndex === index
                          })}
                          key={JSON.stringify(item)}
                          {...getItemProps?.({
                              key: JSON.stringify(item),
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
