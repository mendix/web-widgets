import { observer } from "mobx-react-lite";
import cn from "classnames";
import React, { createElement, useMemo, useRef } from "react";
import { useSelect, UseSelectProps } from "downshift";
import { classes, Cross, Arrow } from "../dropdown-primitives";
import { OptionWithState } from "../../typings/OptionListFilterInterface";
import { autoUpdate, useFloating, size } from "@floating-ui/react-dom";

interface DropdownProps {
    value: string;
    options: OptionWithState[];
    useSelectProps: () => UseSelectProps<OptionWithState>;
    onClear: () => void;
    clearable: boolean;
}

const cls = classes();
// eslint-disable-next-line prefer-arrow-callback
export const Select = observer(function Select(props: DropdownProps): React.ReactElement {
    const toggleRef = useRef<HTMLButtonElement>(null);
    const { getToggleButtonProps, getMenuProps, getItemProps, isOpen, highlightedIndex } = useSelect(
        props.useSelectProps()
    );

    const { refs, floatingStyles } = useFloatingMenu(isOpen);
    const isEmpty = !props.options.some(item => item.selected);

    return (
        <div
            className={cn(cls.root, "form-control", "variant-select")}
            ref={refs.setReference}
            data-expanded={isOpen}
            data-empty={isEmpty ? true : undefined}
        >
            <button
                className={cls.toggle}
                {...getToggleButtonProps({
                    "aria-label": props.value,
                    ref: toggleRef
                })}
            >
                {props.value}
            </button>
            {!isEmpty && (
                <button
                    className={cls.clear}
                    tabIndex={-1}
                    aria-label="Clear combobox"
                    onClick={() => {
                        props.onClear();
                        toggleRef.current?.focus();
                    }}
                >
                    <Cross className={cls.clearIcon} />
                </button>
            )}
            <Arrow className={cls.stateIcon} />
            <div className={cls.popover} hidden={!isOpen} ref={refs.setFloating} style={floatingStyles}>
                <div className={cls.menuSlot}>
                    <ul {...getMenuProps({ className: cls.menu })}>
                        {isOpen &&
                            props.options.map((item, index) => (
                                <li
                                    data-selected={item.selected || undefined}
                                    data-highlighted={highlightedIndex === index || undefined}
                                    key={index}
                                    className={cls.menuItem}
                                    {...getItemProps({ item, index })}
                                >
                                    {item.caption}
                                </li>
                            ))}
                    </ul>
                </div>
            </div>
        </div>
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
