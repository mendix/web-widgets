import classNames from "classnames";
import { PropGetters } from "downshift/typings";
import { createElement, ReactElement } from "react";
import { createPortal } from "react-dom";
import { SingleSelector } from "../helpers/types";
import { FilterTypeEnum } from "../../typings/DropdownProps";

interface DropdownMenuProps extends Partial<PropGetters<any>> {
    dropdownSize: DOMRect | undefined;
    isOpen: boolean;
    filterType: FilterTypeEnum;
    selector: SingleSelector;
    highlightedIndex: number | null;
    selectedItem?: string | null;
}

export function DropdownMenu(props: DropdownMenuProps): ReactElement {
    const { dropdownSize, isOpen, selector, highlightedIndex } = props;
    return createPortal(
        <ul
            className={classNames("widget-dropdown-menu", { "widget-dropdown-menu-hidden": !isOpen })}
            {...props.getMenuProps?.()}
            style={{
                width: dropdownSize?.width,
                left: dropdownSize?.x,
                top: (dropdownSize?.top || 0) + (dropdownSize?.height || 0)
            }}
        >
            {isOpen
                ? selector.options.getAll(props.filterType).map((item, index) => (
                      <li
                          className={classNames("widget-dropdown-item", {
                              "widget-dropdown-item-selected": selector.currentValue === item,
                              "widget-dropdown-item-highlighted": highlightedIndex === index
                          })}
                          key={JSON.stringify(item)}
                          {...props.getItemProps?.({
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
