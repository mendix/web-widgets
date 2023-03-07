import Downshift from "downshift";
import { createElement, ReactElement, useRef } from "react";
import { DropdownContainerProps } from "../../typings/DropdownProps";
import { AssociationSingleSelector } from "../helpers/Association/AssociationSingleSelector";
import { EnumBooleanSingleSelector } from "../helpers/EnumBool/EnumBoolSingleSelector";
import { SingleSelector } from "../helpers/types";
import { DropdownMenu } from "./DropdownMenu";
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

export function Dropdown(props: DropdownContainerProps): ReactElement {
    const selectorRef = useRef<SingleSelector | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLInputElement>(null);
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
                <div className="widget-dropdown" {...getRootProps({}, { suppressRefError: true })}>
                    <div
                        ref={dropdownRef}
                        style={{ border: isOpen ? "1px solid #264ae5" : undefined }}
                        className="form-control"
                        {...getToggleButtonProps()}
                    >
                        <input
                            className="flex-grow"
                            ref={inputRef}
                            {...getInputProps()}
                            placeholder={selector.caption.get(selector.currentValue)}
                            style={{
                                border: "none"
                            }}
                        />

                        {selector.clearable && selector.currentValue !== null && (
                            <button
                                className="widget-dropdown-clear-button"
                                onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    selectItem(null);
                                }}
                            >
                                <div className="widget-dropdown-clear-button">
                                    <svg fill={isOpen ? "black" : "gray"} height="10" width="10" viewBox="0 0 329 329">
                                        <path d="m194.800781 164.769531 128.210938-128.214843c8.34375-8.339844 8.34375-21.824219 0-30.164063-8.339844-8.339844-21.824219-8.339844-30.164063 0l-128.214844 128.214844-128.210937-128.214844c-8.34375-8.339844-21.824219-8.339844-30.164063 0-8.34375 8.339844-8.34375 21.824219 0 30.164063l128.210938 128.214843-128.210938 128.214844c-8.34375 8.339844-8.34375 21.824219 0 30.164063 4.15625 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921875-2.089844 15.082031-6.25l128.210937-128.214844 128.214844 128.214844c4.160156 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921874-2.089844 15.082031-6.25 8.34375-8.339844 8.34375-21.824219 0-30.164063zm0 0" />
                                    </svg>
                                </div>
                            </button>
                        )}
                        <div className="widget-dropdown-down-arrow">
                            <svg fill={isOpen ? "black" : "gray"} height="20" width="20" viewBox="0 0 20 20">
                                <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
                            </svg>
                        </div>
                    </div>
                    <DropdownMenu
                        dropdownSize={dropdownRef.current?.getBoundingClientRect().width}
                        selector={selector}
                        getMenuProps={getMenuProps}
                        getItemProps={getItemProps}
                        isOpen={isOpen}
                        selectedItem={selectedItem}
                        highlightedIndex={highlightedIndex}
                    />
                </div>
            )}
        </Downshift>
    );
}
