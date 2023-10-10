import { SelectionType } from "@mendix/widget-plugin-grid/selection";
import classNames from "classnames";
import { createElement, ReactElement, ReactNode } from "react";

type P = Omit<JSX.IntrinsicElements["div"], "ref" | "role">;

interface ListBoxProps extends P {
    children?: ReactNode;
    lg: number;
    md: number;
    sm: number;
    selectionType: SelectionType;
    multiselectable: boolean | undefined;
}

export function ListBox({
    children,
    className,
    selectionType,
    multiselectable,
    lg,
    md,
    sm,
    ...rest
}: ListBoxProps): ReactElement {
    return (
        <div
            {...rest}
            className={classNames(
                "widget-gallery-items",
                `widget-gallery-lg-${lg}`,
                `widget-gallery-md-${md}`,
                `widget-gallery-sm-${sm}`,
                className
            )}
            role={selectionType === "None" ? "list" : "listbox"}
            aria-multiselectable={multiselectable}
        >
            {children}
        </div>
    );
}
