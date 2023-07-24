import classNames from "classnames";
import Downshift from "downshift";
import { createElement, ReactElement, useRef, useState } from "react";
import { useActionEvents } from "../hooks/useActionEvents";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";
import { ClearButton, DownArrow } from "../assets/icons";
import { useDownshiftProps } from "../hooks/useDownshiftProps";
import { useGetSelector } from "../hooks/useGetSelector";
import { ComboboxMenu } from "./ComboboxMenu";
import { Placeholder } from "./Placeholder";

export function Combobox(props: ComboboxContainerProps): ReactElement {
    const inputRef = useRef<HTMLInputElement>(null);
    const comboboxRef = useRef<HTMLDivElement>(null);
    const selector = useGetSelector(props);
    const downshiftProps = useDownshiftProps(
        selector,
        inputRef.current,
        props.emptyOptionText?.value,
        props.onChangeEvent
    );
    const actionEvents = useActionEvents(props);
    const [focused, setFocused] = useState(false);
    const readOnly =
        (props.attributeBoolean?.readOnly || props.attributeEnumeration?.readOnly) ??
        props.attributeAssociation?.readOnly;

    if (selector.status === "unavailable") {
        return <Placeholder />;
    }

    function handleFocus(): void {
        setFocused(true);
    }

    function handleBlur(): void {
        setFocused(false);
    }

    return (
        <Downshift {...downshiftProps}>
            {({
                getInputProps,
                getItemProps,
                selectedItem,
                getMenuProps,
                clearSelection,
                isOpen,
                highlightedIndex,
                getToggleButtonProps
            }): JSX.Element => (
                <div className="widget-combobox" {...actionEvents}>
                    <div
                        ref={comboboxRef}
                        tabIndex={-1}
                        className={classNames("form-control", "widget-combobox-input-container", {
                            "widget-combobox-input-container-active": isOpen || focused,
                            "widget-combobox-input-container-disabled": readOnly
                        })}
                        {...getToggleButtonProps({
                            disabled: readOnly
                        })}
                    >
                        <input
                            id="widget-combobox-input"
                            className="widget-combobox-input"
                            tabIndex={0}
                            ref={inputRef}
                            {...getInputProps({
                                onFocus: handleFocus,
                                onBlur: handleBlur,
                                disabled: readOnly,
                                readOnly: props.filterType === "no"
                            })}
                            placeholder={
                                downshiftProps.selectedItem
                                    ? selector.caption.get(selector.currentValue)
                                    : props.emptyOptionText?.value
                            }
                        />
                        {!readOnly && selector.clearable && selector.currentValue !== null && (
                            <button
                                className="widget-combobox-clear-button"
                                onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    clearSelection(() => selector.setValue(null));
                                }}
                            >
                                <ClearButton />
                            </button>
                        )}
                        <div className="widget-combobox-down-arrow">
                            <DownArrow />
                        </div>
                    </div>
                    <ComboboxMenu
                        comboboxSize={comboboxRef.current?.getBoundingClientRect()}
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
