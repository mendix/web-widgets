import { observer } from "mobx-react-lite";
import React, { createElement, Fragment, useId, useMemo } from "react";
import { useSelect, UseSelectProps } from "downshift";
import { ValueButton, Menu, Root, Toggle, MenuItem, Popover, MenuSlot } from "./primitives";
import { OptionWithState } from "../typings/OptionListFilterInterface";
import { autoUpdate, useFloating, size } from "@floating-ui/react-dom";

interface DropdownProps {
    triggerValue: string;
    items: OptionWithState[];
    getHookProps: () => UseSelectProps<OptionWithState>;
}

// eslint-disable-next-line prefer-arrow-callback
export const Select = observer(function Select(props: DropdownProps): React.ReactElement {
    const valueId = useId();
    const { getToggleButtonProps, getMenuProps, getItemProps, isOpen, highlightedIndex } = useSelect(
        props.getHookProps()
    );

    const { refs, floatingStyles } = useFloatingMenu(isOpen);

    return (
        <Fragment>
            <Root className="variant-select" ref={refs.setReference}>
                <ValueButton {...getToggleButtonProps({ id: valueId, "aria-label": props.triggerValue })}>
                    {props.triggerValue}
                </ValueButton>
                <Toggle {...getToggleButtonProps()} />
                <Popover hidden={!isOpen} ref={refs.setFloating} style={floatingStyles}>
                    <MenuSlot>
                        <Menu {...getMenuProps()}>
                            {isOpen &&
                                props.items.map((item, index) => (
                                    <MenuItem
                                        data-selected={item.selected || undefined}
                                        data-highlighted={highlightedIndex === index || undefined}
                                        key={index}
                                        {...getItemProps({ item, index })}
                                    >
                                        {item.caption}
                                    </MenuItem>
                                ))}
                        </Menu>
                    </MenuSlot>
                </Popover>
            </Root>
        </Fragment>
    );
});

function useFloatingMenu(open: boolean): ReturnType<typeof useFloating> {
    const middleware = useMemo(
        () => [
            size({
                apply({ rects, elements }) {
                    Object.assign(elements.floating.style, {
                        width: `${rects.reference.width}px`
                    });
                }
            })
        ],
        []
    );

    return useFloating({
        open,
        placement: "bottom-start",
        strategy: "fixed",
        middleware,
        whileElementsMounted: autoUpdate
    });
}
