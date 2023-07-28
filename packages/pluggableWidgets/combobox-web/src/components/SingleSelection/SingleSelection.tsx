import classNames from "classnames";
import { useDownshiftSingleSelectProps } from "../../hooks/useDownshiftSingleSelectProps";
import { createElement, ReactElement, useRef, useState } from "react";
import { useActionEvents } from "../../hooks/useActionEvents";
import { ComboboxContainerProps } from "../../../typings/ComboboxProps";
import { ClearButton, DownArrow } from "../../assets/icons";
import { useGetSelector } from "../../hooks/useGetSelector";
import { SingleSelectionMenu } from "./SingleSelectionMenu";
import { Placeholder } from "../Placeholder";

export function SingleSelection(props: ComboboxContainerProps): ReactElement {
    const inputRef = useRef<HTMLInputElement>(null);
    const [_inputValue, setInputValue] = useState<string>("");
    const comboboxRef = useRef<HTMLDivElement>(null);
    const selector = useGetSelector(props);
    const { getInputProps, toggleMenu, getItemProps, selectedItem, getMenuProps, reset, isOpen, highlightedIndex } =
        useDownshiftSingleSelectProps(
            selector,
            inputRef.current,
            props.emptyOptionText?.value,
            setInputValue,
            props.onChangeEvent
        );

    const actionEvents = useActionEvents(props);
    const readOnly =
        (props.attributeBoolean?.readOnly || props.attributeEnumeration?.readOnly) ??
        props.attributeAssociation?.readOnly;

    if (selector.status === "unavailable") {
        return <Placeholder />;
    }

    return (
        <div className="widget-combobox" {...actionEvents}>
            <div
                ref={comboboxRef}
                tabIndex={-1}
                className={classNames("form-control", "widget-combobox-input-container", {
                    "widget-combobox-input-container-active": isOpen,
                    "widget-combobox-input-container-disabled": readOnly
                })}
            >
                <input
                    id="widget-combobox-input"
                    className="widget-combobox-input"
                    tabIndex={0}
                    ref={inputRef}
                    {...getInputProps(
                        {
                            disabled: readOnly,
                            readOnly: props.filterType === "no"
                        },
                        { suppressRefError: true }
                    )}
                    placeholder={selectedItem ? selector.caption.get(selectedItem) : props.emptyOptionText?.value}
                />
                {!readOnly && selector.clearable && selector.currentValue !== null && (
                    <button
                        className="widget-combobox-clear-button"
                        onClick={e => {
                            e.stopPropagation();
                            selector.setValue(null);
                            reset();
                        }}
                    >
                        <ClearButton />
                    </button>
                )}
                <div className="widget-combobox-down-arrow" onClick={toggleMenu}>
                    <DownArrow />
                </div>
            </div>
            <SingleSelectionMenu
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
    );
}
