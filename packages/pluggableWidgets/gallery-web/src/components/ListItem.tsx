import classNames from "classnames";
import { createElement, ReactElement, ReactNode } from "react";

type P = Omit<JSX.IntrinsicElements["div"], "ref" | "role">;

interface ListItemProps extends P {
    children?: ReactNode;
    role?: "option" | "listitem";
}

export function ListItem({ children, className, role = "listitem", ...rest }: ListItemProps): ReactElement {
    const selected = false;
    const clickable = false;

    return (
        <div
            className={classNames(
                "widget-gallery-item",
                {
                    "widget-gallery-clickable": clickable,
                    "widget-gallery-selected": selected
                },
                className
            )}
            role={role}
            {...rest}
        >
            {children}
        </div>
    );
}
