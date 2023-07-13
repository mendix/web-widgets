import { KeyboardEvent, createElement, useRef, useState } from "react";
import { getSelectedCaptionsPlaceholder } from "src/helpers/utils";
import { ComboboxContainerProps } from "typings/ComboboxProps";
import { ClearButton, DownArrow } from "../../assets/icons";
import { useActionEvents } from "../../hooks/useActionEvents";
import { useDownshiftMultiSelectProps } from "../../hooks/useDownshiftMultiSelectProps";
import { useGetMultiSelector } from "../../hooks/useGetSelector";
import { Placeholder } from "../Placeholder";
import { MultiSelectionMenu } from "./MultiSelectionMenu";
import classNames from "classnames";

export function MultiSelection(props: ComboboxContainerProps) {
    const comboboxRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [_input, setInput] = useState("");
    const selector = useGetMultiSelector(props);
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
        <div className="widget-combobox" {...useActionEvents}>
            <div
                className={classNames("form-control", "widget-combobox-input-container", {
                    "widget-combobox-input-container-active": isOpen,
                    "widget-combobox-input-container-disabled": readOnly
                })}
                ref={comboboxRef}
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
                        className="widget-combobox-input"
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
                                disabled: readOnly,
                                onKeyDown: (event: KeyboardEvent) => {
                                    if (event.key === "Backspace" && inputValue === "") {
                                        setActiveIndex(selectedItems.length - 1);
                                    }
                                },
                                readOnly: props.filterType === "no"
                            },
                            { suppressRefError: true }
                        )}
                    />
                </div>

                {!readOnly && selector.clearable && selector.currentValue !== null && (
                    <button
                        className="widget-combobox-clear-button"
                        onClick={e => {
                            e.preventDefault();
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
                comboboxElement={comboboxRef.current}
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
