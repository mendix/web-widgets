import { PropGetters } from "downshift/typings";
import { createElement } from "react";
import { SingleSelector } from "../helpers/types";

interface DropdownMenuProps extends Partial<PropGetters<any>> {
    dropdownSize: number | undefined;
    isOpen: boolean;
    selector: SingleSelector;
    highlightedIndex: number | null;
    selectedItem: string | null;
}

export function DropdownMenu(props: DropdownMenuProps) {
    const { dropdownSize, isOpen, selector, highlightedIndex, selectedItem } = props;
    return (
        <div>
            <ul
                className="dropdown-menu"
                {...props.getMenuProps?.()}
                style={{
                    display: !isOpen ? "none" : "inline",
                    left: "unset",
                    width: dropdownSize,
                    padding: 0
                }}
            >
                {isOpen
                    ? selector.options.getAll().map((item, index) => (
                          <li
                              className="dropdown-item"
                              {...props.getItemProps?.({
                                  key: JSON.stringify(item),
                                  index,
                                  item: item,
                                  style: {
                                      backgroundColor:
                                          selectedItem === item
                                              ? "rgb(101 163 244)"
                                              : highlightedIndex === index
                                              ? "rgb(195 221 255)"
                                              : "white",
                                      color: selectedItem === item ? "white" : "black"
                                  }
                              })}
                          >
                              {selector.caption.render(item)}
                          </li>
                      ))
                    : null}
            </ul>
        </div>
    );
}
