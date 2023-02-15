import { createElement, ReactNode, useRef } from "react";
import Downshift from "downshift";
import { DropdownContainerProps } from "../typings/DropdownProps";
import { AssociationSingleSelector } from "./helpers/Association/AssociationSingleSelector";
import { EnumBooleanSingleSelector } from "./helpers/EnumBool/EnumBoolSingleSelector";
import { SingleSelector } from "./helpers/types";
// import { executeAction } from "@mendix/pluggable-widgets-commons";

// attribute options
// enum options - needs no other properties, value and caption are from universe
// custom options

function getSelector(props: DropdownContainerProps): SingleSelector {
    if (props.optionsSourceType === "enumerationOrBoolean") {
        return new EnumBooleanSingleSelector();
    } else if (props.optionsSourceType === "association") {
        return new AssociationSingleSelector();
    } else {
        throw new Error(`'optionsSourceType' of type '${props.optionsSourceType}' is not supported`);
    }
}

export default function Dropdown(props: DropdownContainerProps): ReactNode | null {
    const selectorRef = useRef<SingleSelector | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);
    if (!selectorRef.current) {
        selectorRef.current = getSelector(props);
    }
    const selector = selectorRef.current!;
    selector.updateProps(props);
    if (selector.status === "unavailable") {
        // show some placeholder, no data at all
        return (
            <div className="widget-dropdown" style={{ flexGrow: 1 }}>
                <div className="form-control" style={{ backgroundColor: "transparent" }}>
                    &nbsp;
                </div>
            </div>
        );
    }

    console.log("props", props);
    console.log("provider", selector);

    return (
        <Downshift
            itemToString={v => selector.caption.get(v)}
            onChange={v => selector.setValue(v)}
            onInputValueChange={v => selector.options.setSearchTerm(v)}
            onStateChange={state => {
                if (state.type === Downshift.stateChangeTypes.clickButton && state.isOpen) {
                    inputRef.current?.focus();
                }
            }}
            selectedItem={selector.currentValue}
            stateReducer={(_state, changes) => {
                switch (changes.type) {
                    case Downshift.stateChangeTypes.clickButton:
                        return {
                            ...changes,
                            // highlightedIndex: state.highlightedIndex,
                            // isOpen: true,
                            inputValue: ""
                        };
                    case Downshift.stateChangeTypes.keyDownEnter:
                    case Downshift.stateChangeTypes.clickItem:
                        return {
                            ...changes,
                            // highlightedIndex: state.highlightedIndex,
                            // isOpen: true,
                            inputValue: ""
                        };

                    default:
                        return changes;
                }
            }}
        >
            {({
                selectItem,
                getInputProps,
                getItemProps,
                getMenuProps,
                isOpen,
                // inputValue,
                highlightedIndex,
                selectedItem,
                getRootProps,
                getToggleButtonProps
            }) => (
                <div
                    className="widget-dropdown"
                    style={{ flexGrow: 1 }}
                    {...getRootProps({}, { suppressRefError: true })}
                >
                    <div
                        style={{ display: "flex", border: isOpen ? "1px solid #264ae5" : undefined }}
                        className="form-control"
                        {...getToggleButtonProps()}
                    >
                        <input
                            ref={inputRef}
                            {...getInputProps()}
                            placeholder={selector.caption.get(selector.currentValue)}
                            style={{
                                border: "none"
                            }}
                        />

                        <div
                            style={{
                                flexGrow: 1,
                                width: !isOpen ? undefined : "2px",
                                opacity: selector.currentValue === null ? "0.7" : undefined
                            }}
                        >
                            {selector.caption.get(selector.currentValue)}
                        </div>

                        {selector.clearable && selector.currentValue !== null && (
                            <button
                                style={{
                                    border: "none",
                                    background: "transparent"
                                }}
                                onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    selectItem(null);
                                }}
                            >
                                ❌
                            </button>
                        )}
                        <div>⬇</div>
                    </div>

                    <ul {...getMenuProps()} style={{ display: !isOpen ? "none" : undefined }}>
                        {isOpen
                            ? selector.options.getAll().map((item, index) => (
                                  <li
                                      {...getItemProps({
                                          key: JSON.stringify(item),
                                          index,
                                          item: item,
                                          style: {
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
            )}
        </Downshift>
    );
}
