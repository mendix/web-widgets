import classNames from "classnames";
import { Fragment, KeyboardEvent, createElement, useRef } from "react";
import { ComboboxContainerProps } from "typings/ComboboxProps";
import { ClearButton } from "../../assets/icons";
import { Selector } from "../../helpers/types";
import { getSelectedCaptionsPlaceholder } from "../../helpers/utils";
import { useDownshiftMultiSelectProps } from "../../hooks/useDownshiftMultiSelectProps";
import { useGetSelector } from "../../hooks/useGetSelector";
import { ComboboxWrapper } from "../ComboboxWrapper";
import { Placeholder } from "../Placeholder";
import { MultiSelectionMenu } from "./MultiSelectionMenu";

export function MultiSelection(props: ComboboxContainerProps) {
    const comboboxRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const selector = useGetSelector(props) as Selector<string[]>;
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
        withCheckbox,
        setSelectedItems
    } = useDownshiftMultiSelectProps(selector, props.selectionType, props.onChangeEvent, inputRef.current);

    if (selector.status === "unavailable") {
        return <Placeholder />;
    }

    return (
        <Fragment>
            <ComboboxWrapper
                ref={comboboxRef}
                isOpen={isOpen}
                readOnly={selector.readOnly}
                getToggleButtonProps={getToggleButtonProps}
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
                            "widget-combobox-input-nofilter": selector.options.filterType === "no"
                        })}
                        tabIndex={0}
                        placeholder={getSelectedCaptionsPlaceholder(selector, selectedItems, withCheckbox)}
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
                                },
                                disabled: selector.readOnly,
                                readOnly: selector.options.filterType === "no"
                            },
                            { suppressRefError: true }
                        )}
                    />
                </div>

                {!selector.readOnly && selector.clearable && selector.currentValue !== null && (
                    <button
                        className="widget-combobox-clear-button"
                        onClick={e => {
                            e.stopPropagation();
                            if (selectedItems.length > 0) {
                                selector.setValue(null);
                                setSelectedItems([]);
                            }
                        }}
                    >
                        <ClearButton />
                    </button>
                )}
            </ComboboxWrapper>
            <MultiSelectionMenu
                withCheckbox={withCheckbox}
                comboboxSize={comboboxRef.current?.getBoundingClientRect()}
                selector={selector}
                isOpen={isOpen}
                highlightedIndex={highlightedIndex}
                selectableItems={items}
                getItemProps={getItemProps}
                getMenuProps={getMenuProps}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
            />
        </Fragment>
    );
}
