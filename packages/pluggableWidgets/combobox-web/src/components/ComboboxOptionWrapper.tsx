import classNames from "classnames";
import { PropsWithChildren, ReactElement } from "react";
import { classes } from "./classes";
import { legacy } from "./legacyModifiers";
import { ComboboxBehavior } from "../hooks/useComboboxBehavior";

interface ComboboxOptionWrapperProps extends PropsWithChildren {
    /** From the Behavior: id, role, aria-selected, the state attributes, ref and the mouse handlers of the option. */
    optionProps: ReturnType<ComboboxBehavior["getOptionProps"]>;
}

export function ComboboxOptionWrapper({ children, optionProps }: ComboboxOptionWrapperProps): ReactElement {
    return (
        <li
            className={classNames(classes.menuItem, {
                [legacy.itemSelected]: optionProps["data-selected"],
                [legacy.itemHighlighted]: optionProps["data-highlighted"]
            })}
            {...optionProps}
        >
            {children}
        </li>
    );
}
