import classNames from "classnames";
import { Fragment, KeyboardEvent, ReactElement, createElement, useRef } from "react";
import { ClearButton } from "../../assets/icons";
import { MultiSelector, SelectionBaseProps } from "../../helpers/types";
import { getSelectedCaptionsPlaceholder } from "../../helpers/utils";
import { useDownshiftMultiSelectProps } from "../../hooks/useDownshiftMultiSelectProps";
import { ComboboxWrapper } from "../ComboboxWrapper";
import { InputPlaceholder } from "../Placeholder";
import { MultiSelectionMenu } from "./MultiSelectionMenu";

export function MultiSelection({ selector, tabIndex, ...options }: SelectionBaseProps<MultiSelector>): ReactElement {
    const {
        isOpen,
        getToggleButtonProps,
        getMenuProps,
        getInputProps,
        highlightedIndex,
        getItemProps,
        inputValue,
        getSelectedItemProps,
        getDropdownProps,
        removeSelectedItem,
        setActiveIndex,
        selectedItems,
        items,
        setSelectedItems,
        toggleSelectedItem
    } = useDownshiftMultiSelectProps(selector, options);
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <Fragment>
            <ComboboxWrapper isOpen={isOpen} readOnly={selector.readOnly} getToggleButtonProps={getToggleButtonProps}>
                <div
                    className={classNames(
                        "widget-combobox-selected-items",
                        `widget-combobox-${selector.selectedItemsStyle}`
                    )}
                >
                    {(selector.selectedItemsStyle === "boxes" || selector.customContentType === "yes") &&
                        selectedItems.map((selectedItemForRender, index) => {
                            return (
                                <div
                                    className="widget-combobox-selected-item"
                                    key={selectedItemForRender}
                                    {...getSelectedItemProps({
                                        selectedItem: selectedItemForRender,
                                        index
                                    })}
                                >
                                    {selector.caption.render(selectedItemForRender, "label")}
                                    <span
                                        className="icon widget-combobox-clear-button"
                                        onClick={e => {
                                            e.stopPropagation();
                                            removeSelectedItem(selectedItemForRender);
                                        }}
                                    >
                                        <ClearButton size={10} />
                                    </span>
                                </div>
                            );
                        })}
                    <input
                        className={classNames("widget-combobox-input", {
                            "widget-combobox-input-nofilter": selector.options.filterType === "none"
                        })}
                        tabIndex={tabIndex}
                        placeholder=" "
                        {...getInputProps({
                            ...getDropdownProps(
                                {
                                    preventKeyAction: isOpen
                                },
                                { suppressRefError: true }
                            ),
                            ref: inputRef,
                            onClick: e => e.stopPropagation(),
                            onKeyDown: (event: KeyboardEvent) => {
                                if (event.key === "Backspace" && inputValue === "") {
                                    setActiveIndex(selectedItems.length - 1);
                                }
                                if (event.key === " ") {
                                    if (highlightedIndex >= 0) {
                                        toggleSelectedItem(highlightedIndex);
                                        event.preventDefault();
                                        event.stopPropagation();
                                    }
                                }
                            },
                            disabled: selector.readOnly,
                            readOnly: selector.options.filterType === "none"
                        })}
                    />
                    <InputPlaceholder isEmpty={selectedItems.length <= 0}>
                        {getSelectedCaptionsPlaceholder(selector, selectedItems)}
                    </InputPlaceholder>
                </div>

                {!selector.readOnly &&
                    selector.clearable &&
                    selector.currentValue !== null &&
                    selector.currentValue.length > 0 && (
                        <button
                            tabIndex={tabIndex}
                            className="widget-combobox-clear-button"
                            onClick={e => {
                                e.stopPropagation();
                                inputRef.current?.focus();
                                if (selectedItems.length > 0) {
                                    setSelectedItems([]);
                                }
                            }}
                        >
                            <ClearButton />
                        </button>
                    )}
            </ComboboxWrapper>
            <MultiSelectionMenu
                selector={selector}
                isOpen={isOpen}
                highlightedIndex={highlightedIndex}
                selectableItems={items}
                getItemProps={getItemProps}
                getMenuProps={getMenuProps}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                noOptionsText={options.noOptionsText}
            />
        </Fragment>
    );
}
