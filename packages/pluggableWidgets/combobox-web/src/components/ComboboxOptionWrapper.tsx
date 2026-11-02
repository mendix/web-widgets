import classNames from "classnames";
import { HTMLAttributes, PropsWithChildren, ReactElement } from "react";

interface ComboboxOptionWrapperProps extends PropsWithChildren {
    isSelected?: boolean;
    isHighlighted?: boolean;
    /** From the Behavior: id, role, aria-selected, ref and the mouse handlers of the option. */
    optionProps: HTMLAttributes<HTMLLIElement>;
}

export function ComboboxOptionWrapper(props: ComboboxOptionWrapperProps): ReactElement {
    const { children, isSelected, isHighlighted, optionProps } = props;
    return (
        <li
            className={classNames("widget-combobox-item", {
                "widget-combobox-item-selected": isSelected,
                "widget-combobox-item-highlighted": isHighlighted
            })}
            {...optionProps}
        >
            {children}
        </li>
    );
}
