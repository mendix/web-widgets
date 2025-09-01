import { UseComboboxPropGetters, UseSelectPropGetters } from "downshift";
import { createElement, CSSProperties, forwardRef, ReactElement, RefObject } from "react";
import { OptionWithState } from "../../typings/OptionWithState";
import { PickerCssClasses } from "../picker-primitives";

type OptionsWrapperProps = {
    cls: PickerCssClasses;
    style: CSSProperties;
    onMenuScroll?: React.UIEventHandler<HTMLUListElement>;
    isOpen: boolean;
    options: OptionWithState[];
    highlightedIndex: number;
    showCheckboxes: boolean;
    label: string;
} & (
    | Pick<UseComboboxPropGetters<OptionWithState>, "getMenuProps" | "getItemProps">
    | Pick<UseSelectPropGetters<OptionWithState>, "getMenuProps" | "getItemProps">
);

const noop = (): void => {};

export const OptionsWrapper = forwardRef((props: OptionsWrapperProps, ref: RefObject<HTMLDivElement>): ReactElement => {
    const {
        cls,
        style,
        onMenuScroll,
        isOpen,
        highlightedIndex,
        showCheckboxes,
        getMenuProps,
        getItemProps,
        label,
        options
    } = props;
    return (
        <div className={cls.popover} hidden={!isOpen} ref={ref} style={style}>
            <div className={cls.menuSlot}>
                <ul {...getMenuProps({ className: cls.menu, "aria-label": label })} onScroll={onMenuScroll}>
                    {isOpen &&
                        options.map((item, index) => (
                            <li
                                data-selected={item.selected || undefined}
                                data-highlighted={highlightedIndex === index || undefined}
                                key={item.value || index}
                                className={cls.menuItem}
                                title={item.caption}
                                {...getItemProps({
                                    item,
                                    index,
                                    "aria-selected": item.selected,
                                    onClick: e => {
                                        e.stopPropagation();
                                    }
                                })}
                            >
                                {showCheckboxes && (
                                    <span className={cls.checkboxSlot}>
                                        <input
                                            className={cls.checkbox}
                                            role="presentation"
                                            type="checkbox"
                                            checked={item.selected}
                                            value={item.caption}
                                            onChange={noop}
                                            tabIndex={-1}
                                        />
                                    </span>
                                )}
                                <span className={cls.menuItemText}>{item.caption || "\u00A0"}</span>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
});
