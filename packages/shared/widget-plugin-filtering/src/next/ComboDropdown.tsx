import { createElement, Fragment } from "react";
import { useCombobox, UseComboboxProps } from "downshift";

interface DropdownProps {
    inputValue: string;
    onStateChange?: UseComboboxProps<string>["onStateChange"];
}

export function ComboDropdown(props: DropdownProps): React.ReactElement {
    const { onStateChange } = props;
    const { getInputProps, getToggleButtonProps, getMenuProps, getItemProps } = useCombobox<string>({
        defaultHighlightedIndex: 0,
        selectedItem: null,
        onStateChange,
        items: ["one", "two", "three"]
    });
    return (
        <Fragment>
            <div className="v-classic">
                <input {...getInputProps()} />
                <button {...getToggleButtonProps()} />
            </div>
            <ul {...getMenuProps()}>
                <li {...getItemProps({ item: "one", index: 0 })}>One</li>
                <li {...getItemProps({ item: "two", index: 1 })}>Two</li>
                <li {...getItemProps({ item: "three", index: 2 })}>Three</li>
            </ul>
        </Fragment>
    );
}
