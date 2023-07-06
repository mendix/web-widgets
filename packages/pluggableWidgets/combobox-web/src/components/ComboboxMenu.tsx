import classNames from "classnames";
import { PropGetters } from "downshift/typings";
import { createElement, ReactElement } from "react";
import { createPortal } from "react-dom";
import { SingleSelector } from "../helpers/types";
import { FilterTypeEnum } from "../../typings/ComboboxProps";

interface ComboboxMenuProps extends Partial<PropGetters<any>> {
    comboboxSize: DOMRect | undefined;
    isOpen: boolean;
    filterType: FilterTypeEnum;
    selector: SingleSelector;
    highlightedIndex: number | null;
    selectedItem?: string | null;
}

export function ComboboxMenu(props: ComboboxMenuProps): ReactElement {
    const { comboboxSize, isOpen, selector, highlightedIndex, getMenuProps, getItemProps } = props;
    return createPortal(
        <ul
            className={classNames("widget-combobox-menu", { "widget-combobox-menu-hidden": !isOpen })}
            {...getMenuProps?.()}
            style={{
                width: comboboxSize?.width,
                left: comboboxSize?.x,
                top: (comboboxSize?.top || 0) + (comboboxSize?.height || 0)
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
        </ul>,
        document.body
    );
}
