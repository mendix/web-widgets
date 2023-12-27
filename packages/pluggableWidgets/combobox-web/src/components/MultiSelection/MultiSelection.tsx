import classNames from "classnames";
import { Fragment, KeyboardEvent, ReactElement, createElement, useRef } from "react";
import { ClearButton } from "../../assets/icons";
import { MultiSelector, SelectionBaseProps } from "../../helpers/types";
import { getSelectedCaptionsPlaceholder } from "../../helpers/utils";
import { useDownshiftMultiSelectProps } from "../../hooks/useDownshiftMultiSelectProps";
import { ComboboxWrapper } from "../ComboboxWrapper";
import { InputPlaceholder } from "../Placeholder";
import { MultiSelectionMenu } from "./MultiSelectionMenu";

export function MultiSelection({
    selector,
    tabIndex,
    a11yConfig,
    showFooter,
    menuFooterContent,
    ...options
}: SelectionBaseProps<MultiSelector>): ReactElement {
    const {
        isOpen,
        getToggleButtonProps,
        getMenuProps,
        getInputProps,
        highlightedIndex,
        getItemProps,
        getSelectedItemProps,
        getDropdownProps,
        removeSelectedItem,
        setActiveIndex,
        selectedItems,
        items,
        setSelectedItems,
        toggleSelectedItem
    } = useDownshiftMultiSelectProps(selector, options, a11yConfig.a11yStatusMessage);
    const inputRef = useRef<HTMLInputElement>(null);
    const isSelectedItemsBoxStyle = selector.selectedItemsStyle === "boxes";
    return (
        <Fragment>
            <ComboboxWrapper
                isOpen={isOpen}
                readOnly={selector.readOnly}
                getToggleButtonProps={getToggleButtonProps}
                validation={selector.validation}
            >
                <div
                    className={classNames(
                        "widget-combobox-selected-items",
                        `widget-combobox-${selector.selectedItemsStyle}`
                    )}
                >
                    {isSelectedItemsBoxStyle &&
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
                                    {!selector.readOnly && (
                                        <span
                                            className="icon widget-combobox-clear-button"
                                            aria-label={a11yConfig.ariaLabels?.removeSelection}
                                            role="button"
                                            onClick={e => {
                                                e.stopPropagation();
                                                removeSelectedItem(selectedItemForRender);
                                            }}
                                        >
                                            <ClearButton size={10} />
                                        </span>
                                    )}
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
                            onKeyDown: (event: KeyboardEvent) => {
                                if (
                                    (event.key === "Backspace" && inputRef.current?.selectionStart === 0) ||
                                    (event.key === "ArrowLeft" &&
                                        isSelectedItemsBoxStyle &&
                                        inputRef.current?.selectionStart === 0)
                                ) {
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
                            aria-label={a11yConfig.ariaLabels?.clearSelection}
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
                showFooter={showFooter}
                menuFooterContent={menuFooterContent}
                inputId={options.inputId}
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
