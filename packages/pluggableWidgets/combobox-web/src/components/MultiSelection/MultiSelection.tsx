import { useCombobox, useMultipleSelection } from "downshift";
import { KeyboardEvent, createElement, useMemo, useRef, useState } from "react";
import { ComboboxContainerProps } from "typings/ComboboxProps";
import { ClearButton, DownArrow } from "../../assets/icons";
import { useGetMultiSelector } from "../../hooks/useGetSelector";
import { MultiSelectionMenu } from "./MultiSelectionMenu";
import { Placeholder } from "../Placeholder";

export function MultiSelection(props: ComboboxContainerProps) {
    const [inputValue, setInputValue] = useState("");
    const comboboxRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const selector = useGetMultiSelector(props);
    const withCheckbox = props.selectionType === "checkbox"; // Add control from config to toggle checkboxes

    const readOnly =
        (props.attributeBoolean?.readOnly || props.attributeEnumeration?.readOnly) ??
        props.attributeAssociation?.readOnly;

    if (selector.status === "unavailable") {
        return <Placeholder />;
    }

    const {
        getSelectedItemProps,
        getDropdownProps,
        removeSelectedItem,
        setActiveIndex,
        selectedItems,
        setSelectedItems
    } = useMultipleSelection({
        selectedItems: selector.currentValue ?? [],
        onStateChange({ selectedItems: newSelectedItems, type }) {
            switch (type) {
                case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete:
                case useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
                    setSelectedItems(newSelectedItems!);
                    selector.setValue(newSelectedItems!);
                    break;
                default:
                    break;
            }
        }
    });
    const filteredItems = useMemo(
        () => selector.options?.getAll().filter(option => !selectedItems.includes(option)),
        [selectedItems]
    );
    const items = withCheckbox ? selector.options?.getAll() : filteredItems;
    const { isOpen, reset, getMenuProps, getInputProps, highlightedIndex, getItemProps } = useCombobox({
        items,
        inputValue,
        selectedItem: "",
        itemToString: (v: string | null) => selector.caption.get(v),
        stateReducer(state, actionAndChanges) {
            const { changes, type } = actionAndChanges;
            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                case useCombobox.stateChangeTypes.ItemClick:
                case useCombobox.stateChangeTypes.InputBlur:
                    return {
                        ...changes,
                        ...(changes.selectedItem && { isOpen: true }),
                        ...(!withCheckbox && { highlightedIndex: 0 })
                    };
                default:
                    return changes;
            }
        },
        onStateChange({ inputValue: newInputValue, type, selectedItem: newSelectedItem }) {
            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                case useCombobox.stateChangeTypes.ItemClick:
                    if (!selectedItems.includes(newSelectedItem!)) {
                        setSelectedItems([...selectedItems, newSelectedItem!]);
                        selector.setValue([...selectedItems, newSelectedItem!]);
                    } else {
                        removeSelectedItem(newSelectedItem!);
                    }
                    break;
                case useCombobox.stateChangeTypes.InputChange:
                    selector.options.setSearchTerm(newInputValue!);
                    setInputValue(newInputValue!);
                    break;
                default:
                    break;
            }
        }
    });
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
            />
        </div>
    );
}
