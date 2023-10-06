import classNames from "classnames";
import { ReactElement, createElement } from "react";
import { SelectionSettings } from "../features/selection";

type P = Omit<JSX.IntrinsicElements["div"], "ref">;

export interface RootProps extends P {
    className?: string;
    selectionMethod: SelectionSettings["selectionMethod"];
}

export function Root(props: RootProps): ReactElement {
    const { className, selectionMethod: selection, children, ...rest } = props;

    return (
        <div
            className={classNames(className, "widget-datagrid", {
                "widget-datagrid-selectable-rows": selection !== "none",
                "widget-datagrid-selection-method-checkbox": selection === "checkbox",
                "widget-datagrid-selection-method-click": selection === "rowClick"
            })}
            {...rest}
        >
            {children}
        </div>
    );
}
