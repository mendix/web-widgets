import { SelectionType } from "@mendix/widget-plugin-grid/selection";
import classNames from "classnames";
import { createElement, ReactElement } from "react";

type ListBoxProps = Omit<JSX.IntrinsicElements["div"], "ref" | "role"> & {
    lg: number;
    md: number;
    sm: number;
    selectionType: SelectionType;
};

export function ListBox({ children, className, selectionType, lg, md, sm, ...rest }: ListBoxProps): ReactElement {
    const selectionEnabled = selectionType !== "None";
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
            role={selectionEnabled ? "listbox" : "list"}
            aria-multiselectable={selectionEnabled ? selectionType === "Multi" : undefined}
        >
            {children}
        </div>
    );
}
