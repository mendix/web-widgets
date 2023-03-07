import { createElement, ReactElement, useRef } from "react";
import Downshift from "downshift";
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
    console.log("Component Props", props);

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
                        ref={dropdownRef}
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
                        <div>
                            <svg height="20" width="20" viewBox="0 0 20 20">
                                <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
                            </svg>
                        </div>
                    </div>
                    <DropdownMenu
                        dropdownRef={dropdownRef}
                        isOpen={isOpen}
                        selectedItem={selectedItem}
                        selector={selector}
                        highlightedIndex={highlightedIndex}
                        getMenuProps={getMenuProps}
                        getItemProps={getItemProps}
                    />
                </div>
            )}
        </Downshift>
    );
}
