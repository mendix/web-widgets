import cn from "classnames";
import { createElement, useRef } from "react";
import { observer } from "mobx-react-lite";
import { OptionWithState } from "../../typings/OptionWithState";
import { useCombobox, UseComboboxProps } from "downshift";
import { Arrow, classes, Cross } from "../picker-primitives";
import { useFloatingMenu } from "../hooks/useFloatingMenu";

interface ComboboxProps {
    options: OptionWithState[];
    inputPlaceholder: string;
    empty: boolean;
    useComboboxProps: () => UseComboboxProps<OptionWithState>;
    onClear: () => void;
    onBlur: React.FocusEventHandler<HTMLInputElement>;
    onFocus: React.FocusEventHandler<HTMLInputElement>;
}

const cls = classes();

// eslint-disable-next-line prefer-arrow-callback
export const Combobox = observer(function Combobox(props: ComboboxProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { isOpen, highlightedIndex, getInputProps, getToggleButtonProps, getMenuProps, getItemProps } = useCombobox(
        props.useComboboxProps()
    );

    const { refs, floatingStyles } = useFloatingMenu(isOpen);

    return (
        <div
            className={cn(cls.root, "form-control", "variant-combobox")}
            ref={refs.setReference}
            data-expanded={isOpen}
            data-empty={props.empty ? true : undefined}
        >
            <input
                className={cls.input}
                {...getInputProps({
                    "aria-label": "Unknown",
                    ref: inputRef,
                    onBlur: props.onBlur,
                    onFocus: props.onFocus,
                    placeholder: props.inputPlaceholder
                })}
            />
            <button className={cls.toggle} {...getToggleButtonProps()}>
                <Arrow className={cls.stateIcon} />
            </button>
            {!props.empty && (
                <button
                    className={cls.clear}
                    tabIndex={-1}
                    aria-label="Clear combobox"
                    onClick={() => {
                        props.onClear();
                        inputRef.current?.focus();
                    }}
                >
                    <Cross className={cls.clearIcon} />
                </button>
            )}
            <div className={cls.popover} hidden={!isOpen} ref={refs.setFloating} style={floatingStyles}>
                <div className={cls.menuSlot}>
                    <ul className={cls.menu} {...getMenuProps()}>
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
