import { createElement, Fragment, useCallback } from "react";
import cn from "classnames";
import { Option } from "../../typings/OptionListFilterInterface";
import { useCombobox, UseComboboxState, UseComboboxStateChangeOptions } from "downshift";

interface ListSearchProps {
    options: Option[];
    onSelect: (value: string) => void;
    onSearch: (search: string) => void;
    searchValue: string;
    multiselect?: boolean;
    classNames?: {
        search?: string;
        listbox?: string;
        item?: string;
        highlightedItem?: string;
        selectedItem?: string;
    };
}

export function ListSearch(props: ListSearchProps): React.ReactElement {
    const { options, classNames = {}, onSearch, onSelect, multiselect = false } = props;
    const {
        search = "search-field",
        listbox = "listbox",
        item = "item",
        selectedItem = "selected",
        highlightedItem = "highlighted"
    } = classNames;

    const { getInputProps, getMenuProps, getItemProps, highlightedIndex } = useCombobox({
        items: options,
        selectedItem: null,
        onInputValueChange: useCallback(
            ({ inputValue }: { inputValue: string }) => {
                console.log("inputValue (ListBox)", inputValue);
                onSearch(inputValue);
            },
            [onSearch]
        ),
        onSelectedItemChange: useCallback(
            ({ selectedItem }: { selectedItem: Option }) => {
                console.log("selectedItem (ListBox)", selectedItem);
                onSelect(selectedItem.value);
            },
            [onSelect]
        ),
        stateReducer,
        isOpen: true,
        itemToString,
        inputValue: props.searchValue
    });

    return (
        <Fragment>
            <style>
                {`
                .listbox {
                    margin: 0;
                    padding: 0;
                    list-style: none;
                    background: #fff;
                }
                .highlighted {
                    background-color: #f0f0f0;
                }
                .selected {
                    background-color: #0077cc;
                    color: white;
                }
                `}
            </style>
            <div className={cn(search)}>
                <input type="text" {...getInputProps()} />
            </div>
            <ul className={cn(listbox)} {...getMenuProps({ "aria-multiselectable": multiselect })}>
                {options.map((option, index) => (
                    <li
                        className={cn(item, {
                            [selectedItem]: option.selected,
                            [highlightedItem]: index === highlightedIndex
                        })}
                        key={option.value}
                        {...getItemProps({
                            item: option,
                            index,
                            "aria-selected": option.selected
                        })}
                    >
                        {option.caption}
                    </li>
                ))}
            </ul>
        </Fragment>
    );
}

const itemToString = (item: Option | null): string => (item ? item.caption : "");

function stateReducer(
    state: UseComboboxState<Option>,
    actionAndChanges: UseComboboxStateChangeOptions<Option>
): Partial<UseComboboxState<Option>> {
    const { changes, type } = actionAndChanges;

    console.log("change type", type, `'${state.inputValue}'` + " -> " + `'${changes.inputValue}'`);
    switch (type) {
        case useCombobox.stateChangeTypes.ControlledPropUpdatedSelectedItem:
            return {
                ...changes,
                inputValue: state.inputValue
            };
        case useCombobox.stateChangeTypes.InputChange:
            return {
                ...changes,
                highlightedIndex: 0
            };
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
            return {
                ...changes,
                inputValue: state.inputValue,
                highlightedIndex: state.highlightedIndex
            };
        default:
            return changes;
    }
}
