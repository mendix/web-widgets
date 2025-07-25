import cn from "classnames";
import { useSelect, UseSelectProps } from "downshift";
import { observer } from "mobx-react-lite";
import React, { createElement, useRef } from "react";
import { OptionWithState } from "../../typings/OptionWithState";
import { OptionsWrapper } from "../base/OptionsWrapper";
import { useFloatingMenu } from "../hooks/useFloatingMenu";
import { Arrow, classes, Cross } from "../picker-primitives";

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
                className={cls.inputContainer}
                {...getToggleButtonProps({
                    "aria-label": props.value,
                    ref: toggleRef,
                    onFocus: props.onFocus
                })}
            >
                <span className={cls.toggle}>{props.value}</span>
                <div className={`${cls.root}-controls`}>
                    {showClear && (
                        <div
                            className={cls.clear}
                            tabIndex={-1}
                            aria-label="Clear combobox"
                            onClick={event => {
                                event.stopPropagation();
                                props.onClear();
                                toggleRef.current?.focus();
                            }}
                        >
                            <Cross />
                        </div>
                    )}
                    <Arrow className={cls.stateIcon} />
                </div>
            </button>
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
