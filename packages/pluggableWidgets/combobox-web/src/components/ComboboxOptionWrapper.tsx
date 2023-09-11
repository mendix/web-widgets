import classNames from "classnames";
import { UseComboboxPropGetters } from "downshift/typings";
import { PropsWithChildren, ReactElement, createElement } from "react";

interface ComboboxOptionWrapperProps extends PropsWithChildren, Partial<UseComboboxPropGetters<string>> {
    isSelected?: boolean;
    isHighlighted?: boolean;
    item: string;
    index: number;
}

export function ComboboxOptionWrapper(props: ComboboxOptionWrapperProps): ReactElement {
    const { children, isSelected, isHighlighted, item, getItemProps, index } = props;
    return (
        <li
            className={classNames("widget-combobox-item", {
                "widget-combobox-item-selected": isSelected,
                "widget-combobox-item-highlighted": isHighlighted
            })}
            {...getItemProps?.({
                index,
                item
            })}
            aria-selected={isSelected}
        >
            {children}
        </li>
    );
}
