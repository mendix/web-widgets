import { observer } from "mobx-react-lite";
import cn from "classnames";
import React, { createElement, Fragment, useId, useMemo } from "react";
import { useSelect, UseSelectProps } from "downshift";
import { ValueButton, Menu, Root, Toggle, MenuItem, Popover, MenuSlot, classes, Arrow } from "./primitives";
import { OptionWithState } from "../typings/OptionListFilterInterface";
import { autoUpdate, useFloating, size } from "@floating-ui/react-dom";

interface DropdownProps {
    triggerValue: string;
    items: OptionWithState[];
    getHookProps: () => UseSelectProps<OptionWithState>;
}

const cls = classes();
// eslint-disable-next-line prefer-arrow-callback
export const Select = observer(function Select(props: DropdownProps): React.ReactElement {
    const valueId = useId();
    const { getToggleButtonProps, getMenuProps, getItemProps, isOpen, highlightedIndex } = useSelect(
        props.getHookProps()
    );

    const { refs, floatingStyles } = useFloatingMenu(isOpen);

    return (
        <Fragment>
            <Root className={cn(cls.root, "form-control", "variant-select")} ref={refs.setReference}>
                <ValueButton
                    className={cls.valueButton}
                    {...getToggleButtonProps({
                        id: valueId,
                        "aria-label": props.triggerValue
                    })}
                >
                    {props.triggerValue}
                </ValueButton>
                <Toggle data-expanded={isOpen} className={cls.toggle} {...getToggleButtonProps()}>
                    <Arrow className={cls.stateIcon} />
                </Toggle>
                <Popover className={cls.popover} hidden={!isOpen} ref={refs.setFloating} style={floatingStyles}>
                    <MenuSlot className={cls.menuSlot}>
                        <Menu {...getMenuProps({ className: cls.menu })}>
                            {isOpen &&
                                props.items.map((item, index) => (
                                    <MenuItem
                                        data-selected={item.selected || undefined}
                                        data-highlighted={highlightedIndex === index || undefined}
                                        key={index}
                                        className={cls.menuItem}
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
