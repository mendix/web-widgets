import { observer } from "mobx-react-lite";
import { createElement, Fragment } from "react";
import { useSelect, UseSelectProps } from "downshift";
import { ValueButton, Menu, Root, Toggle } from "./primitives";
import { OptionWithState } from "../typings/OptionListFilterInterface";

interface DropdownProps {
    triggerValue: string;
    items: OptionWithState[];
    getHookProps: () => UseSelectProps<OptionWithState>;
}

// eslint-disable-next-line prefer-arrow-callback
export const Select = observer(function Select(props: DropdownProps): React.ReactElement {
    const { getToggleButtonProps, getMenuProps, getItemProps } = useSelect(props.getHookProps());
    return (
        <Fragment>
            <Root className="v-classic">
                <ValueButton {...getToggleButtonProps()}>{props.triggerValue}</ValueButton>
                <Toggle {...getToggleButtonProps()} />
            </Root>
            <Menu {...getMenuProps()}>
                {props.items.map((item, index) => (
                    <li key={index} {...getItemProps({ item, index })}>
                        {item.caption}
                    </li>
                ))}
            </Menu>
        </Fragment>
    );
});
