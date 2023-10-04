import classNames from "classnames";
import { ReactElement, createElement } from "react";
import { GridSelectionMethod } from "@mendix/widget-plugin-grid/selection/useGridSelectionProps";

type P = Omit<JSX.IntrinsicElements["div"], "ref">;

export interface RootProps extends P {
    className?: string;
    selection?: boolean;
    selectionMethod: GridSelectionMethod;
}

export function Root(props: RootProps): ReactElement {
    const { className, selectionMethod, selection, children, ...rest } = props;

    return (
        <div
            className={classNames(className, "widget-datagrid", {
                "widget-datagrid-selectable-rows": selection,
                "widget-datagrid-selection-method-checkbox": selectionMethod === "checkbox",
                "widget-datagrid-selection-method-click": selectionMethod === "rowClick"
            })}
            {...rest}
        >
            {children}
        </div>
    );
}
