import { UseComboboxPropGetters, UseSelectPropGetters } from "downshift";
import { createElement, CSSProperties, forwardRef, ReactElement, RefObject } from "react";
import { OptionWithState } from "../../typings/OptionWithState";

type OptionsWrapperClassNamesProps = {
    popover?: string;
    menuSlot?: string;
    menu?: string;
    menuItem?: string;
    checkboxSlot?: string;
    checkbox?: string;
};

type OptionsWrapperProps = {
    cls: OptionsWrapperClassNamesProps;
    style: CSSProperties;
    onMenuScroll?: React.UIEventHandler<HTMLUListElement>;
    isOpen: boolean;
    options: OptionWithState[];
    highlightedIndex: number;
    showCheckboxes?: boolean;
    haveEmptyFirstOption?: boolean;
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
        haveEmptyFirstOption,
        getMenuProps,
        getItemProps
    } = props;
    return (
        <div className={cls.popover} hidden={!isOpen} ref={ref} style={style}>
            <div className={cls.menuSlot}>
                <ul {...getMenuProps({ className: cls.menu })} onScroll={onMenuScroll}>
                    {isOpen &&
                        props.options.map((item, index) => (
                            <li
                                data-selected={item.selected || undefined}
                                data-highlighted={highlightedIndex === index || undefined}
                                key={item.value || index}
                                className={cls.menuItem}
                                {...getItemProps({ item, index, "aria-selected": item.selected })}
                            >
                                {showCheckboxes && (
                                    <span className={cls.checkboxSlot}>
                                        {haveEmptyFirstOption && index === 0 ? (
                                            <div style={{ width: 16, height: 16 }} />
                                        ) : (
                                            <input
                                                className={props.cls.checkbox}
                                                role="presentation"
                                                type="checkbox"
                                                checked={item.selected}
                                                value={item.caption}
                                                onChange={noop}
                                                tabIndex={-1}
                                            />
                                        )}
                                    </span>
                                )}
                                {item.caption}
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
});
