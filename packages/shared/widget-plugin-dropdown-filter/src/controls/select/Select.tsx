import cn from "classnames";
import { useSelect, UseSelectProps } from "downshift";
import { observer } from "mobx-react-lite";
import React, { createElement } from "react";
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
    showCheckboxes: boolean;
    style?: React.CSSProperties;
    useSelectProps: () => UseSelectProps<OptionWithState>;
    onClear: () => void;
    onFocus?: React.FocusEventHandler<HTMLDivElement>;
    onMenuScroll?: React.UIEventHandler<HTMLUListElement>;
    ariaLabel: string;
}

const cls = classes();

export const Select = observer(function Select(props: SelectProps): React.ReactElement {
    const { empty: isEmpty, showCheckboxes, clearable } = props;
    const { getToggleButtonProps, getMenuProps, getItemProps, isOpen, highlightedIndex } = useSelect(
        props.useSelectProps()
    );
    const showClear = clearable && !isEmpty;

    const { refs, floatingStyles } = useFloatingMenu(isOpen);

    return (
        <div
            className={cn(cls.root, "form-control", "variant-select", props.className)}
            data-expanded={isOpen}
            data-empty={isEmpty ? true : undefined}
            style={props.style}
            {...getToggleButtonProps({
                "aria-label": props.ariaLabel || "filter",
                ref: refs.setReference,
                onFocus: props.onFocus
            })}
        >
            <div className={cls.inputContainer}>
                <span className={cls.toggle}>{props.value}</span>
                <div className={`${cls.root}-controls`}>
                    <ClearButton
                        cls={cls}
                        onClick={() => {
                            props.onClear();
                            refs.reference.current?.focus();
                        }}
                        visible={showClear}
                    />
                    <Arrow className={cls.stateIcon} />
                </div>
            </div>
            <OptionsWrapper
                cls={cls}
                label={props.ariaLabel}
                ref={refs.setFloating}
                style={floatingStyles}
                onMenuScroll={props.onMenuScroll}
                isOpen={isOpen}
                options={props.options}
                highlightedIndex={highlightedIndex}
                showCheckboxes={showCheckboxes}
                getMenuProps={getMenuProps}
                getItemProps={getItemProps}
            />
        </div>
    );
});
