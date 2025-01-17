import cn from "classnames";
import { useSelect, UseSelectProps } from "downshift";
import { observer } from "mobx-react-lite";
import React, { createElement, useRef } from "react";
import { OptionWithState } from "../../typings/OptionListFilterInterface";
import { Arrow, classes, Cross } from "../picker-primitives";
import { useFloatingMenu } from "../hooks/useFloatingMenu";

interface DropdownProps {
    value: string;
    options: OptionWithState[];
    clearable: boolean;
    empty: boolean;
    useSelectProps: () => UseSelectProps<OptionWithState>;
    onClear: () => void;
}

const cls = classes();
// eslint-disable-next-line prefer-arrow-callback
export const Select = observer(function Select(props: DropdownProps): React.ReactElement {
    const { empty: isEmpty } = props;
    const toggleRef = useRef<HTMLButtonElement>(null);
    const { getToggleButtonProps, getMenuProps, getItemProps, isOpen, highlightedIndex } = useSelect(
        props.useSelectProps()
    );

    const { refs, floatingStyles } = useFloatingMenu(isOpen);

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
                    aria-label="Clear"
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
