import cn from "classnames";
import { useCombobox, UseComboboxProps, useMultipleSelection, UseMultipleSelectionProps } from "downshift";
import { observer } from "mobx-react-lite";
import { createElement, useId, useRef } from "react";
import { OptionWithState } from "../../typings/OptionWithState";
import { ClearButton } from "../base/ClearButton";
import { OptionsWrapper } from "../base/OptionsWrapper";
import { useFloatingMenu } from "../hooks/useFloatingMenu";
import { Arrow, classes, Cross } from "../picker-primitives";

interface TagPickerProps {
    selected: OptionWithState[];
    options: OptionWithState[];
    empty: boolean;
    inputPlaceholder: string;
    showCheckboxes: boolean;
    selectedStyle?: "boxes" | "text";
    ariaLabel?: string;
    className?: string;
    style?: React.CSSProperties;
    useMultipleSelectionProps: () => UseMultipleSelectionProps<OptionWithState>;
    useComboboxProps: () => UseComboboxProps<OptionWithState>;
    onClear: () => void;
    onBlur: () => void;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    onMenuScroll?: React.UIEventHandler<HTMLUListElement>;
}

const cls = classes();

// eslint-disable-next-line prefer-arrow-callback
export const TagPicker = observer(function TagPicker(props: TagPickerProps): React.ReactElement {
    const [inputContainerId, helperText1] = [useId(), useId()];
    const { showCheckboxes, selectedStyle = "boxes", ariaLabel: inputLabel = "Search" } = props;
    const inputRef = useRef<HTMLInputElement>(null);
    const { getSelectedItemProps, getDropdownProps, removeSelectedItem } = useMultipleSelection(
        props.useMultipleSelectionProps()
    );
    const { isOpen, highlightedIndex, getInputProps, getToggleButtonProps, getMenuProps, getItemProps } = useCombobox(
        props.useComboboxProps()
    );
    const { refs, floatingStyles } = useFloatingMenu(isOpen);
    const showRemoveItem = selectedStyle === "boxes";

    return (
        <div
            className={cn(
                cls.root,
                "form-control",
                {
                    "variant-tag-picker-text": selectedStyle === "text",
                    "variant-tag-picker": selectedStyle === "boxes"
                },
                props.className
            )}
            ref={refs.setReference}
            data-expanded={isOpen}
            data-empty={props.empty ? true : undefined}
            style={props.style}
        >
            <span id={helperText1} className="sr-only">
                Current filter values:
            </span>
            <div
                id={inputContainerId}
                className={cls.inputContainer}
                onClick={event => {
                    if (event.currentTarget === event.target) {
                        inputRef.current?.focus();
                    }
                }}
            >
                {props.selected.map((item, index) => (
                    <div
                        className={cls.selectedItem}
                        key={index}
                        {...getSelectedItemProps({ selectedItem: item, index })}
                    >
                        {item.caption}
                        {showRemoveItem && (
                            <span
                                className={cls.removeIcon}
                                onClick={e => {
                                    e.stopPropagation();
                                    removeSelectedItem(item);
                                }}
                            >
                                <Cross width="10" height="10" />
                            </span>
                        )}
                    </div>
                ))}
                <input
                    className={cls.input}
                    {...getInputProps({
                        "aria-label": inputLabel,
                        onBlur: props.onBlur,
                        onFocus: props.onFocus,
                        placeholder: props.empty ? props.inputPlaceholder : undefined,
                        ...getDropdownProps({ preventKeyAction: isOpen, ref: inputRef }),
                        "aria-describedby": props.empty ? undefined : `${helperText1} ${inputContainerId}`
                    })}
                />
            </div>
            <button className={cls.toggle} {...getToggleButtonProps({ "aria-label": "Show options" })}>
                <Arrow className={cls.stateIcon} />
            </button>
            <ClearButton
                cls={cls}
                onClick={() => {
                    props.onClear();
                    inputRef.current?.focus();
                }}
                showSeparator
                visible={!props.empty}
            />
            <OptionsWrapper
                cls={cls}
                ref={refs.setFloating}
                style={floatingStyles}
                onMenuScroll={props.onMenuScroll}
                isOpen={isOpen}
                options={props.options}
                highlightedIndex={highlightedIndex}
                showCheckboxes={showCheckboxes}
                haveEmptyFirstOption={false}
                getMenuProps={getMenuProps}
                getItemProps={getItemProps}
            />
        </div>
    );
});
