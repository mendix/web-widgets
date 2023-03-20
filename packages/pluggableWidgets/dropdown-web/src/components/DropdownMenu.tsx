/* eslint-disable react/jsx-key */
import classNames from "classnames";
import { PropGetters } from "downshift/typings";
import { createElement, ReactElement } from "react";
import { createPortal } from "react-dom";
import { SingleSelector } from "../helpers/types";

export interface DropdownMenuProps extends Partial<PropGetters<any>> {
    dropdownSize: DOMRect | undefined;
    isOpen: boolean;
    selector: SingleSelector;
    highlightedIndex: number | null;
    selectedItem: string | null;
}

export function DropdownMenu(props: DropdownMenuProps): ReactElement {
    const { dropdownSize, isOpen, selector, highlightedIndex, selectedItem } = props;
    return createPortal(
        <ul
            className={classNames("widget-dropdown-menu", { hidden: !isOpen })}
            {...props.getMenuProps?.()}
            style={{
                width: dropdownSize?.width,
                left: dropdownSize?.x,
                top: (dropdownSize?.top || 0) + (dropdownSize?.height || 0)
            }}
        >
            {isOpen
                ? selector.options.getAll().map((item, index) => (
                      <li
                          className={classNames("widget-dropdown-item")}
                          {...props.getItemProps?.({
                              key: JSON.stringify(item),
                              index,
                              item,
                              style: {
                                  backgroundColor:
                                      selectedItem === item
                                          ? "#E6EAFF"
                                          : highlightedIndex === index
                                          ? "#F5F6F6"
                                          : "#FFFFFF"
                              }
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
