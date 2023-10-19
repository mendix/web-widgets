import { GridSelectionMethod } from "@mendix/widget-plugin-grid/selection/useGridSelectionProps";
import classNames from "classnames";
import { ReactElement, createElement, forwardRef } from "react";

type P = JSX.IntrinsicElements["div"];

export interface WidgetRootProps extends P {
    className?: string;
    selection?: boolean;
    selectionMethod: GridSelectionMethod;
}

export const WidgetRoot = forwardRef(
    (props: WidgetRootProps, ref: React.ForwardedRef<HTMLDivElement>): ReactElement => {
        const { className, selectionMethod, selection, children, ...rest } = props;

        return (
            <div
                className={classNames(className, "widget-datagrid", {
                    "widget-datagrid-selectable-rows": selection,
                    "widget-datagrid-selection-method-checkbox": selection && selectionMethod === "checkbox",
                    "widget-datagrid-selection-method-click": selection && selectionMethod === "rowClick"
                })}
                ref={ref}
                {...rest}
                style={{ position: "relative" }}
            >
                {children}
            </div>
        );
    }
);
