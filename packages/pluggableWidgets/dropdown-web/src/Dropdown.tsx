import { ReactNode, createElement } from "react";
import Downshift from "downshift";
import { DropdownContainerProps } from "../typings/DropdownProps";
import { matchSorter } from "match-sorter";
// import { executeAction } from "@mendix/pluggable-widgets-commons";

export default function Dropdown(props: DropdownContainerProps): ReactNode {
    console.log("props", props.dataSource);
    const items = [{ value: "apple" }, { value: "pear" }, { value: "orange" }, { value: "grape" }, { value: "banana" }];
    return (
        <Downshift itemToString={item => (item ? item.value : "")}>
            {({
                getInputProps,
                getItemProps,
                getLabelProps,
                getMenuProps,
                isOpen,
                inputValue,
                highlightedIndex,
                selectedItem,
                getRootProps
            }) => (
                <div>
                    <label {...getLabelProps()}>Enter a fruit {props.customName}</label>
                    <div style={{ display: "inline-block" }} {...getRootProps({}, { suppressRefError: true })}>
                        <input {...getInputProps()} />
                    </div>
                    <ul {...getMenuProps()}>
                        {isOpen
                            ? // @ts-ignore
                              matchSorter(items, inputValue, { keys: ["value"] }).map((item, index) => (
                                  // eslint-disable-next-line react/jsx-key
                                  <li
                                      {...getItemProps({
                                          key: item.value,
                                          index,
                                          item,
                                          style: {
                                              backgroundColor: highlightedIndex === index ? "lightgray" : "white",
                                              fontWeight: selectedItem === item ? "bold" : "normal"
                                          }
                                      })}
                                  >
                                      {item.value}
                                  </li>
                              ))
                            : null}
                    </ul>
                </div>
            )}
        </Downshift>
    );
}
