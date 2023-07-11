import { KeyboardEvent, createElement, useRef } from "react";
import { ComboboxContainerProps } from "typings/ComboboxProps";
import { ClearButton, DownArrow } from "../../assets/icons";
import { useGetMultiSelector } from "../../hooks/useGetSelector";
import { useMultipleSelectionProps } from "../../hooks/useMultipleSelectionProps";
import { MultiSelectionMenu } from "./MultiSelectionMenu";
import { Placeholder } from "../Placeholder";

export function MultiSelection(props: ComboboxContainerProps) {
    const comboboxRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const selector = useGetMultiSelector(props);
    const {
        getSelectedItemProps,
        getDropdownProps,
        removeSelectedItem,
        setActiveIndex,
        selectedItems,
        isOpen,
        reset,
        getMenuProps,
        getInputProps,
        inputValue,
        highlightedIndex,
        getItemProps,
        items,
        withCheckbox
    } = useMultipleSelectionProps(selector, props.selectionType, props.emptyOptionText?.value);

    const readOnly =
        (props.attributeBoolean?.readOnly || props.attributeEnumeration?.readOnly) ??
        props.attributeAssociation?.readOnly;

    if (selector.status === "unavailable") {
        return <Placeholder />;
    }
    return (
        <div className="widget-combobox">
            <div className="form-control widget-combobox-input-container" ref={comboboxRef}>
                <div className="widget-combobox-selected-items">
                    {withCheckbox
                        ? selectedItems.map((item, index) => {
                              return (
                                  <span
                                      className="widget-combobox-selected-item"
                                      key={`selected-item-${index}`}
                                      {...getSelectedItemProps({ selectedItem: item, index })}
                                  >
                                      {selector.caption.render(item)}
                                      {index !== selectedItems.length - 1 && ","}
                                  </span>
                              );
                          })
                        : selectedItems.map((selectedItemForRender, index) => {
                              return (
                                  <span
                                      className="widget-combobox-selected-item"
                                      style={{ backgroundColor: "lightgray" }}
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
                        {...getInputProps({
                            ...getDropdownProps({
                                preventKeyAction: isOpen
                            }),
                            onKeyDown: (event: KeyboardEvent) => {
                                if (event.key === "Backspace" && inputValue === "") {
                                    setActiveIndex(selectedItems.length - 1);
                                }
                            }
                        })}
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
                <div className="widget-combobox-down-arrow">
                    <DownArrow />
                </div>
            </div>
            <MultiSelectionMenu
                withCheckbox={withCheckbox}
                comboboxSize={comboboxRef.current?.getBoundingClientRect()}
                selector={selector}
                isOpen={isOpen}
                highlightedIndex={highlightedIndex}
                items={items}
                getItemProps={getItemProps}
                getMenuProps={getMenuProps}
                allItems={selector.options?.getAll()}
            />
        </div>
    );
}
