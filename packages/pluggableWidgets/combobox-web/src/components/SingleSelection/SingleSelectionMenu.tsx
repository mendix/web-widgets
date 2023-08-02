import classNames from "classnames";
import { PropGetters } from "downshift/typings";
import { createElement, ReactElement } from "react";
import { Selector } from "../../helpers/types";
import { FilterTypeEnum } from "../../../typings/ComboboxProps";

interface ComboboxMenuProps extends Partial<PropGetters<any>> {
    comboboxSize: DOMRect | undefined;
    isOpen: boolean;
    filterType: FilterTypeEnum;
    selector: Selector<string>;
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
                ? selector.options.getAll(props.filterType).map((item, index) => (
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
