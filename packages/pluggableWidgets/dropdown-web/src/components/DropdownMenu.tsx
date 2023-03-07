import { createElement } from "react";
import { PropGetters } from "downshift/typings";
import { SingleSelector } from "../helpers/types";

interface DropdownMenuProps extends Partial<PropGetters<any>> {
    dropdownRef: React.RefObject<HTMLInputElement>;
    isOpen: boolean;
    selector: SingleSelector;
    highlightedIndex: number | null;
    selectedItem: string | null;
}

export function DropdownMenu(props: DropdownMenuProps) {
    const { dropdownRef, isOpen, selector, highlightedIndex, selectedItem } = props;
    return (
        <div>
            <ul
                {...props.getMenuProps?.()}
                style={{
                    position: "absolute",
                    display: !isOpen ? "none" : undefined,
                    borderRadius: "10px",
                    margin: "4px 0 0 0",
                    padding: 0,
                    overflow: "hidden",
                    zIndex: 20,
                    width: dropdownRef.current?.getBoundingClientRect().width,
                    border: "1px solid #264ae5",
                    listStyleType: "none"
                }}
            >
                {isOpen
                    ? selector.options.getAll().map((item, index) => (
                          <li
                              {...props.getItemProps?.({
                                  key: JSON.stringify(item),
                                  index,
                                  item: item,
                                  style: {
                                      display: "flex",
                                      //   alignContent: "center",
                                      padding: "0 0 0 10px",
                                      height: "30px",
                                      border: highlightedIndex === index ? "1px solid #264ae5" : undefined,
                                      backgroundColor: highlightedIndex === index ? "lightgray" : "white",
                                      fontWeight: selectedItem === item ? "bold" : "normal"
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
