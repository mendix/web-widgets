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
    onFocus?: React.FocusEventHandler<HTMLButtonElement>;
    onMenuScroll?: React.UIEventHandler<HTMLUListElement>;
    showCheckboxes?: boolean;
}

const cls = classes();
// eslint-disable-next-line prefer-arrow-callback
export const Select = observer(function Select(props: DropdownProps): React.ReactElement {
    const { empty: isEmpty, showCheckboxes, clearable } = props;
    const toggleRef = useRef<HTMLButtonElement>(null);
    const { getToggleButtonProps, getMenuProps, getItemProps, isOpen, highlightedIndex } = useSelect(
        props.useSelectProps()
    );
    const showClear = clearable && !isEmpty;

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
                    ref: toggleRef,
                    onFocus: props.onFocus
                })}
            >
                {props.value}
            </button>
            {showClear && (
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
                    <ul {...getMenuProps({ className: cls.menu })} onScroll={props.onMenuScroll}>
                        {isOpen &&
                            props.options.map((item, index) => (
                                <li
                                    data-selected={item.selected || undefined}
                                    data-highlighted={highlightedIndex === index || undefined}
                                    key={index}
                                    className={cls.menuItem}
                                    {...getItemProps({ item, index })}
                                >
                                    {showCheckboxes && (
                                        <span className={cls.checkboxSlot}>
                                            {index > 0 ? (
                                                <input
                                                    role="presentation"
                                                    type="checkbox"
                                                    checked={item.selected}
                                                    value={item.caption}
                                                    onChange={noop}
                                                    tabIndex={-1}
                                                />
                                            ) : (
                                                <div style={{ width: 16, height: 16 }} />
                                            )}
                                        </span>
                                    )}
                                    {item.caption}
                                </li>
                            ))}
                    </ul>
                </div>
            </div>
        </div>
    );
});

const noop = (): void => {};
