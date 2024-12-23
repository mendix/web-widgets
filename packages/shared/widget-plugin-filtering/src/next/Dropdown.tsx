import { createElement, Fragment } from "react";
import { useSelect, UseSelectProps } from "downshift";
import { DropdownButton, DropdownMenu, DropdownRoot, DropdownToggle } from "./primitives";
import { OptionWithState } from "../typings/OptionListFilterInterface";

interface DropdownProps {
    triggerValue: string;
    items: OptionWithState[];
    getHookProps: () => UseSelectProps<OptionWithState>;
}

export function Dropdown(props: DropdownProps): React.ReactElement {
    const { getToggleButtonProps, getMenuProps, getItemProps } = useSelect(props.getHookProps());
    return (
        <Fragment>
            <DropdownRoot className="v-classic">
                <DropdownButton {...getToggleButtonProps()}>{props.triggerValue}</DropdownButton>
                <DropdownToggle {...getToggleButtonProps()} />
            </DropdownRoot>
            <DropdownMenu {...getMenuProps()}>
                {props.items.map((item, index) => (
                    <li key={index} {...getItemProps({ item, index })}>
                        {item.caption}
                    </li>
                ))}
            </DropdownMenu>
        </Fragment>
    );
}
