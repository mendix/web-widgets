import cn from "classnames";
import { useSelect, UseSelectProps } from "downshift";
import { observer } from "mobx-react-lite";
import React, { createElement, useRef } from "react";
import { OptionWithState } from "../../typings/OptionWithState";
import { ClearButton } from "../base/ClearButton";
import { OptionsWrapper } from "../base/OptionsWrapper";
import { useFloatingMenu } from "../hooks/useFloatingMenu";
import { Arrow, classes } from "../picker-primitives";

interface SelectProps {
    value: string;
    options: OptionWithState[];
    clearable: boolean;
    empty: boolean;
    className?: string;
    showCheckboxes?: boolean;
    style?: React.CSSProperties;
    useSelectProps: () => UseSelectProps<OptionWithState>;
    onClear: () => void;
    onFocus?: React.FocusEventHandler<HTMLButtonElement>;
    onMenuScroll?: React.UIEventHandler<HTMLUListElement>;
}

const cls = classes();
// eslint-disable-next-line prefer-arrow-callback
export const Select = observer(function Select(props: SelectProps): React.ReactElement {
    const { empty: isEmpty, showCheckboxes, clearable } = props;
    const toggleRef = useRef<HTMLButtonElement>(null);
    const { getToggleButtonProps, getMenuProps, getItemProps, isOpen, highlightedIndex } = useSelect(
        props.useSelectProps()
    );
    const showClear = clearable && !isEmpty;

    const { refs, floatingStyles } = useFloatingMenu(isOpen);

    return (
        <div
            className={cn(cls.root, "form-control", "variant-select", props.className)}
            ref={refs.setReference}
            data-expanded={isOpen}
            data-empty={isEmpty ? true : undefined}
            style={props.style}
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
            <ClearButton
                cls={cls}
                onClick={() => {
                    props.onClear();
                    toggleRef.current?.focus();
                }}
                showSeparator={false}
                visible={showClear}
            />
            <Arrow className={cls.stateIcon} />
            <OptionsWrapper
                cls={cls}
                ref={refs.setFloating}
                style={floatingStyles}
                onMenuScroll={props.onMenuScroll}
                isOpen={isOpen}
                options={props.options}
                highlightedIndex={highlightedIndex}
                showCheckboxes={showCheckboxes}
                haveEmptyFirstOption
                getMenuProps={getMenuProps}
                getItemProps={getItemProps}
            />
        </div>
    );
});
