import cn from "classnames";
import { useSelect, UseSelectProps } from "downshift";
import { observer } from "mobx-react-lite";
import { CSSProperties, FocusEventHandler, ReactElement, UIEventHandler } from "react";
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
    style?: CSSProperties;
    useSelectProps: () => UseSelectProps<OptionWithState>;
    onClear: () => void;
    onFocus?: FocusEventHandler<HTMLDivElement>;
    onMenuScroll?: UIEventHandler<HTMLUListElement>;
    ariaLabel: string;
}

const cls = classes();

export const Select = observer(function Select(props: SelectProps): ReactElement {
    const { empty: isEmpty, showCheckboxes, clearable } = props;
    const { getToggleButtonProps, getMenuProps, getItemProps, isOpen, highlightedIndex } = useSelect(
        props.useSelectProps()
    );
    const showClear = clearable && !isEmpty;

    const { refs, floatingStyles } = useFloatingMenu(isOpen);
    const { ref: _ignoredRef, ...buttonProps } = getToggleButtonProps({
        "aria-label": props.ariaLabel || "filter",
        onFocus: props.onFocus
    });
    return (
        <div
            ref={refs.setReference}
            className={cn(cls.root, "form-control", "variant-select", props.className)}
            data-expanded={isOpen}
            data-empty={isEmpty ? true : undefined}
            style={props.style}
            {...buttonProps}
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
