import { ReactNode, createElement } from "react";
import Downshift from "downshift";
// import { executeAction } from "@mendix/pluggable-widgets-commons";

export default function Dropdown(): ReactNode {
    const items = [{ value: "apple" }, { value: "pear" }, { value: "orange" }, { value: "grape" }, { value: "banana" }];

    return (
        <div>
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
                        <label {...getLabelProps()}>Enter a fruit</label>
                        <div style={{ display: "inline-block" }} {...getRootProps({}, { suppressRefError: true })}>
                            <input {...getInputProps()} />
                        </div>
                        <ul {...getMenuProps()}>
                            {isOpen
                                ? items
                                      .filter(item => !inputValue || item.value.includes(inputValue))
                                      .map((item, index) => (
                                          // eslint-disable-next-line react/jsx-key
                                          <li
                                              {...getItemProps({
                                                  key: item.value,
                                                  index,
                                                  item,
                                                  style: {
                                                      backgroundColor:
                                                          highlightedIndex === index ? "lightgray" : "white",
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
        </div>
    );
}
