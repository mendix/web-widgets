import { KeyboardEvent, createElement, useRef, useState } from "react";
import { getSelectedCaptionsPlaceholder } from "src/helpers/utils";
import { Selector } from "../../helpers/types";
import { ComboboxContainerProps } from "typings/ComboboxProps";
import { ClearButton, DownArrow } from "../../assets/icons";
import { useActionEvents } from "../../hooks/useActionEvents";
import { useDownshiftMultiSelectProps } from "../../hooks/useDownshiftMultiSelectProps";
import { useGetSelector } from "../../hooks/useGetSelector";
import { Placeholder } from "../Placeholder";
import { MultiSelectionMenu } from "./MultiSelectionMenu";
import classNames from "classnames";

export function MultiSelection(props: ComboboxContainerProps) {
    const comboboxRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [_input, setInput] = useState("");
    const noFilter = props.filterType === "no";
    const selector = useGetSelector(props) as Selector<string[]>;
    const actionEvents = useActionEvents(props);
    const {
        getSelectedItemProps,
        getDropdownProps,
        removeSelectedItem,
        setActiveIndex,
        selectedItems,
        isOpen,
        inputValue,
        reset,
        getMenuProps,
        getInputProps,
        highlightedIndex,
        getItemProps,
        toggleMenu,
        items,
        withCheckbox
    } = useDownshiftMultiSelectProps(selector, setInput, props.selectionType, props.onChangeEvent, inputRef.current);

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
                <div className="widget-combobox-selected-items">
                    {!withCheckbox &&
                        selectedItems.map((selectedItemForRender, index) => {
                            return (
                                <span
                                    className="widget-combobox-selected-item"
                                    key={`selected-item-${index}`}
                                    {...getSelectedItemProps({
                                        selectedItem: selectedItemForRender,
                                        index
                                    })}
                                >
                                    {selector.caption.render(selectedItemForRender)}
                                    <span
                                        className="widget-combobox-selected-item-remove-icon"
                                        onClick={e => {
                                            e.stopPropagation();
                                            removeSelectedItem(selectedItemForRender);
                                        }}
                                    >
                                        <ClearButton size={"8"} />
                                    </span>
                                </span>
                            );
                        })}
                    <input
                        ref={inputRef}
                        className={classNames("widget-combobox-input", {
                            "widget-combobox-input-nofilter": noFilter
                        })}
                        tabIndex={0}
                        placeholder={getSelectedCaptionsPlaceholder(
                            selector,
                            selectedItems,
                            withCheckbox,
                            props.emptyOptionText
                        )}
                        {...getInputProps(
                            {
                                ...getDropdownProps({
                                    preventKeyAction: isOpen
                                }),
                                onKeyDown: (event: KeyboardEvent) => {
                                    if (event.key === "Backspace" && inputValue === "") {
                                        setActiveIndex(selectedItems.length - 1);
                                    }
                                },
                                disabled: readOnly,
                                readOnly: noFilter
                            },
                            { suppressRefError: true }
                        )}
                    />
                </div>

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
            <MultiSelectionMenu
                withCheckbox={withCheckbox}
                comboboxSize={comboboxRef.current?.getBoundingClientRect()}
                selector={selector}
                isOpen={isOpen}
                highlightedIndex={highlightedIndex}
                selectableItems={items}
                getItemProps={getItemProps}
                getMenuProps={getMenuProps}
                allItems={selector.options?.getAll()}
                selectedItems={selectedItems}
            />
        </div>
    );
}
