import { createElement, Fragment } from "react";
import { useCombobox, UseComboboxProps } from "downshift";
import { Input, Menu, Root, Toggle } from "./primitives";

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
            <Root className="v-classic">
                <Input {...getInputProps()} />
                <Toggle {...getToggleButtonProps()} />
            </Root>
            <Menu {...getMenuProps()}>
                <li {...getItemProps({ item: "one", index: 0 })}>One</li>
                <li {...getItemProps({ item: "two", index: 1 })}>Two</li>
                <li {...getItemProps({ item: "three", index: 2 })}>Three</li>
            </Menu>
        </Fragment>
    );
}
