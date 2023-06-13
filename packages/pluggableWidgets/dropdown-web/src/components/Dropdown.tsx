import classNames from "classnames";
import Downshift from "downshift";
import { createElement, ReactElement, useRef } from "react";
import { useActionEvents } from "../hooks/useActionEvents";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";
import { ClearButton, DownArrow } from "../assets/icons";
import { useDownshiftProps } from "../hooks/useDownshiftProps";
import { useGetSelector } from "../hooks/useGetSelector";
import { DropdownMenu } from "./DropdownMenu";
import { Placeholder } from "./Placeholder";

export function Dropdown(props: ComboboxContainerProps): ReactElement {
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLInputElement>(null);
    const selector = useGetSelector(props);
    const downshiftProps = useDownshiftProps(selector, inputRef.current, props.emptyOptionText?.value);
    const actionEvents = useActionEvents(props);
    const readOnly = props.attributeEnumerationOrBoolean?.readOnly ?? props.attributeAssociation?.readOnly;

    if (selector.status === "unavailable") {
        return <Placeholder />;
    }

    return (
        <Downshift {...downshiftProps}>
            {({
                selectItem,
                getInputProps,
                getItemProps,
                selectedItem,
                getMenuProps,
                isOpen,
                highlightedIndex,
                getToggleButtonProps
            }): JSX.Element => (
                <div className="widget-dropdown" {...actionEvents}>
                    <div
                        ref={dropdownRef}
                        className={classNames("form-control", "widget-dropdown-input-container", {
                            "widget-dropdown-input-container-active":
                                isOpen || document.activeElement === inputRef.current
                        })}
                        {...getToggleButtonProps({
                            disabled: readOnly
                        })}
                    >
                        <input
                            tabIndex={0}
                            id="widget-dropdown-input"
                            className="widget-dropdown-input"
                            ref={inputRef}
                            {...getInputProps({
                                disabled: readOnly
                            })}
                            placeholder={
                                downshiftProps.selectedItem
                                    ? selector.caption.get(selector.currentValue)
                                    : props.emptyOptionText?.value
                            }
                        />
                        {!readOnly && selector.clearable && selector.currentValue !== null && (
                            <button
                                className="widget-dropdown-clear-button"
                                onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    selectItem(null);
                                    selector.setValue(null);
                                }}
                            >
                                <ClearButton />
                            </button>
                        )}
                        <div className="widget-dropdown-down-arrow">
                            <DownArrow />
                        </div>
                    </div>
                    <DropdownMenu
                        dropdownSize={dropdownRef.current?.getBoundingClientRect()}
                        selector={selector}
                        filterType={props.filterType}
                        selectedItem={selectedItem}
                        getMenuProps={getMenuProps}
                        getItemProps={getItemProps}
                        isOpen={isOpen}
                        highlightedIndex={highlightedIndex}
                    />
                </div>
            )}
        </Downshift>
    );
}
