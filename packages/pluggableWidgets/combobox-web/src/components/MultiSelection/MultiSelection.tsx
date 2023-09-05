import classNames from "classnames";
import { Fragment, KeyboardEvent, ReactElement, createElement } from "react";
import { ClearButton } from "../../assets/icons";
import { MultiSelector, SelectionBaseProps } from "../../helpers/types";
import { getSelectedCaptionsPlaceholder } from "../../helpers/utils";
import { useDownshiftMultiSelectProps } from "../../hooks/useDownshiftMultiSelectProps";
import { ComboboxWrapper } from "../ComboboxWrapper";
import { InputPlaceholder } from "../Placeholder";
import { MultiSelectionMenu } from "./MultiSelectionMenu";

interface MultiSelectionProps extends SelectionBaseProps {
    selector: MultiSelector;
}

export function MultiSelection({ selector, tabIndex, ...options }: MultiSelectionProps): ReactElement {
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

    return (
        <Fragment>
            <ComboboxWrapper isOpen={isOpen} readOnly={selector.readOnly} getToggleButtonProps={getToggleButtonProps}>
                <div
                    className={classNames(
                        "widget-combobox-selected-items",
                        `widget-combobox-${selector.selectedItemsStyle}`
                    )}
                >
                    {selector.selectedItemsStyle === "boxes" &&
                        selectedItems.map((selectedItemForRender, index) => {
                            return (
                                <span
                                    className="widget-combobox-selected-item"
                                    key={selectedItemForRender}
                                    {...getSelectedItemProps({
                                        selectedItem: selectedItemForRender,
                                        index
                                    })}
                                >
                                    {selector.caption.render(selectedItemForRender)}
                                    <span
                                        className="icon widget-combobox-clear-button"
                                        onClick={e => {
                                            e.stopPropagation();
                                            removeSelectedItem(selectedItemForRender);
                                        }}
                                    >
                                        <ClearButton />
                                    </span>
                                </span>
                            );
                        })}
                    <input
                        className={classNames("widget-combobox-input", {
                            "widget-combobox-input-nofilter": selector.options.filterType === "no"
                        })}
                        tabIndex={tabIndex}
                        placeholder=" "
                        {...getInputProps(
                            {
                                ...getDropdownProps({
                                    preventKeyAction: isOpen
                                }),
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
                                readOnly: selector.options.filterType === "no"
                            },
                            { suppressRefError: true }
                        )}
                    />
                    {selector.selectedItemsStyle === "text" && (
                        <InputPlaceholder isEmpty={selectedItems.length <= 0}>
                            {getSelectedCaptionsPlaceholder(selector, selectedItems)}
                        </InputPlaceholder>
                    )}
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
                placeholderText={options.noItemText}
            />
        </Fragment>
    );
}
