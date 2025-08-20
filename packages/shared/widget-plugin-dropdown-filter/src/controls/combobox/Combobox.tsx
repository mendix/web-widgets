import cn from "classnames";
import { useCombobox, UseComboboxProps } from "downshift";
import { observer } from "mobx-react-lite";
import { createElement, useRef } from "react";
import { OptionWithState } from "../../typings/OptionWithState";
import { ClearButton } from "../base/ClearButton";
import { OptionsWrapper } from "../base/OptionsWrapper";
import { useFloatingMenu } from "../hooks/useFloatingMenu";
import { Arrow, classes } from "../picker-primitives";

interface ComboboxProps {
    options: OptionWithState[];
    inputPlaceholder: string;
    emptyCaption: string;
    ariaLabel: string;
    empty: boolean;
    className?: string;
    style?: React.CSSProperties;
    useComboboxProps: () => UseComboboxProps<OptionWithState>;
    onClear: () => void;
    onBlur: React.FocusEventHandler<HTMLInputElement>;
    onFocus: React.FocusEventHandler<HTMLInputElement>;
    onMenuScroll?: React.UIEventHandler<HTMLUListElement>;
}

const cls = classes();

export const Combobox = observer(function Combobox(props: ComboboxProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { isOpen, highlightedIndex, getInputProps, getToggleButtonProps, getMenuProps, getItemProps } = useCombobox(
        props.useComboboxProps()
    );

    const { refs, floatingStyles } = useFloatingMenu(isOpen);

    return (
        <div
            className={cn(cls.root, "form-control", "variant-combobox", props.className)}
            ref={refs.setReference}
            data-expanded={isOpen}
            data-empty={props.empty ? true : undefined}
            style={props.style}
        >
            <input
                className={cls.input}
                {...getInputProps({
                    "aria-label": props.ariaLabel || "filter",
                    ref: inputRef,
                    onBlur: props.onBlur,
                    onFocus: props.onFocus,
                    placeholder: props.empty ? (isOpen ? props.inputPlaceholder : props.emptyCaption) : undefined
                })}
            />
            <ClearButton
                cls={cls}
                onClick={() => {
                    props.onClear();
                    inputRef.current?.focus();
                }}
                visible={!props.empty}
            />
            <button className={cls.toggle} {...getToggleButtonProps({ "aria-label": "Show options" })}>
                <Arrow className={cls.stateIcon} />
            </button>
            <OptionsWrapper
                cls={cls}
                label={props.ariaLabel}
                ref={refs.setFloating}
                style={floatingStyles}
                onMenuScroll={props.onMenuScroll}
                isOpen={isOpen}
                options={props.options}
                highlightedIndex={highlightedIndex}
                showCheckboxes={false}
                getMenuProps={getMenuProps}
                getItemProps={getItemProps}
            />
        </div>
    );
});
