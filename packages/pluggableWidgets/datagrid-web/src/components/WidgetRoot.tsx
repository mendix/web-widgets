import { GridSelectionMethod } from "@mendix/widget-plugin-grid/selection/useGridSelectionProps";
import classNames from "classnames";
import { ReactElement, createElement } from "react";

type P = JSX.IntrinsicElements["div"];

export interface WidgetRootProps extends P {
    className?: string;
    selection?: boolean;
    selectionMethod: GridSelectionMethod;
    exporting?: boolean;
}

export function WidgetRoot(props: WidgetRootProps): ReactElement {
    const { className, selectionMethod, selection, exporting, children, ...rest } = props;
    return (
        <div
            {...rest}
            className={classNames(className, "widget-datagrid", {
                "widget-datagrid-exporting": exporting,
                "widget-datagrid-selectable-rows": selection,
                "widget-datagrid-selection-method-checkbox": selection && selectionMethod === "checkbox",
                "widget-datagrid-selection-method-click": selection && selectionMethod === "rowClick"
            })}
        >
            {children}
        </div>
    );
}
