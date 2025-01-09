import { createElement, useRef } from "react";
import { observer } from "mobx-react-lite";
import { Arrow, Cross, classes } from "../picker-primitives";
import cn from "classnames";
import { useFloatingMenu } from "../hooks/useFloatingMenu";
import { OptionWithState } from "../../typings/BaseSelectStore";
import { useCombobox, UseComboboxProps, useMultipleSelection, UseMultipleSelectionProps } from "downshift";

interface MultiboxProps {
    selectedItems: OptionWithState[];
    options: OptionWithState[];
    useMultipleSelectionProps: () => UseMultipleSelectionProps<OptionWithState>;
    inputPlaceholder: string;
    useComboboxProps: () => UseComboboxProps<OptionWithState>;
    onClear: () => void;
    onBlur: () => void;
}

const cls = classes();

// eslint-disable-next-line prefer-arrow-callback
export const Multibox = observer(function Multibox(props: MultiboxProps): React.ReactElement {
    const inputRef = useRef<HTMLInputElement>(null);
    const { getSelectedItemProps, getDropdownProps, removeSelectedItem } = useMultipleSelection(
        props.useMultipleSelectionProps()
    );
    const { isOpen, highlightedIndex, getInputProps, getToggleButtonProps, getMenuProps, getItemProps } = useCombobox(
        props.useComboboxProps()
    );

    const isEmpty = !props.options.some(item => item.selected);

    const { refs, floatingStyles } = useFloatingMenu(isOpen);
    return (
        <div
            className={cn(cls.root, "form-control", "variant-multiselect")}
            ref={refs.setReference}
            data-expanded={isOpen}
            data-empty={isEmpty ? true : undefined}
        >
            <div className={cls.selection}>
                {props.selectedItems.map((item, index) => (
                    <span key={index} {...getSelectedItemProps({ selectedItem: item, index })}>
                        {item.caption}
                        <span
                            className="px-1 cursor-pointer"
                            onClick={e => {
                                e.stopPropagation();
                                removeSelectedItem(item);
                            }}
                        >
                            &#10005;
                        </span>
                    </span>
                ))}
            </div>
            <input
                className={cls.input}
                {...getInputProps({
                    "aria-label": "Unknown",
                    ref: inputRef,
                    onBlur: props.onBlur,
                    placeholder: props.inputPlaceholder,
                    ...getDropdownProps({ preventKeyAction: isOpen })
                })}
            />
            <button className={cls.toggle} {...getToggleButtonProps()}>
                <Arrow className={cls.stateIcon} />
            </button>
            {!isEmpty && (
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
