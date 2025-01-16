import { createElement, useRef, Fragment } from "react";
import { observer } from "mobx-react-lite";
import { Arrow, Cross, classes } from "../picker-primitives";
import cn from "classnames";
import { useFloatingMenu } from "../hooks/useFloatingMenu";
import { OptionWithState } from "../../typings/OptionWithState";
import { useCombobox, UseComboboxProps, useMultipleSelection, UseMultipleSelectionProps } from "downshift";

interface TagPickerProps {
    selectedItems: OptionWithState[];
    options: OptionWithState[];
    empty: boolean;
    inputPlaceholder: string;
    useMultipleSelectionProps: () => UseMultipleSelectionProps<OptionWithState>;
    useComboboxProps: () => UseComboboxProps<OptionWithState>;
    onClear: () => void;
    onBlur: () => void;
}

const cls = classes();

// eslint-disable-next-line prefer-arrow-callback
export const TagPicker = observer(function TagPicker(props: TagPickerProps): React.ReactElement {
    const inputRef = useRef<HTMLInputElement>(null);
    const { getSelectedItemProps, getDropdownProps, removeSelectedItem } = useMultipleSelection(
        props.useMultipleSelectionProps()
    );
    const { isOpen, highlightedIndex, getInputProps, getToggleButtonProps, getMenuProps, getItemProps } = useCombobox(
        props.useComboboxProps()
    );
    const { refs, floatingStyles } = useFloatingMenu(isOpen);

    return (
        <div
            className={cn(cls.root, "form-control", "variant-tag-picker")}
            ref={refs.setReference}
            data-expanded={isOpen}
            data-empty={props.empty ? true : undefined}
        >
            <div
                className={cls.inputContainer}
                onClick={event => {
                    if (event.currentTarget === event.target) {
                        inputRef.current?.focus();
                    }
                }}
            >
                {props.selectedItems.map((item, index) => (
                    <div
                        className={cls.selectedItem}
                        key={index}
                        {...getSelectedItemProps({ selectedItem: item, index })}
                    >
                        {item.caption}
                        <span
                            className={cls.removeIcon}
                            onClick={e => {
                                e.stopPropagation();
                                removeSelectedItem(item);
                            }}
                        >
                            <Cross width="10" height="10" />
                        </span>
                    </div>
                ))}
                <input
                    className={cls.input}
                    {...getInputProps({
                        "aria-label": "Unknown",
                        onBlur: props.onBlur,
                        placeholder: props.inputPlaceholder,
                        ...getDropdownProps({ preventKeyAction: isOpen, ref: inputRef })
                    })}
                />
            </div>
            <button className={cls.toggle} {...getToggleButtonProps()}>
                <Arrow className={cls.stateIcon} />
            </button>
            {!props.empty && (
                <Fragment>
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
                    <div className={cls.separator} role="presentation" />
                </Fragment>
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
