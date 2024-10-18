import classNames from "classnames";
import { ReactElement, createElement, useRef, useMemo } from "react";
import { useHelpersContext } from "../helpers/helpers-context";

type P = JSX.IntrinsicElements["div"];

export interface WidgetRootProps extends P {
    className?: string;
    exporting?: boolean;
}

export function WidgetRoot(props: WidgetRootProps): ReactElement {
    const { className, exporting, children, ...rest } = props;
    const ref = useRef<HTMLDivElement>(null);
    const style = useMemo(() => {
        const s = { ...props.style };
        if (exporting && ref.current) {
            s.height = ref.current.offsetHeight;
        }
        return s;
    }, [props.style, exporting]);
    const { selectActionHelper } = useHelpersContext();
    const selectionMethod = selectActionHelper.selectionMethod;
    const selectionEnabled = selectActionHelper.selectionType !== "None";

    return (
        <div
            {...rest}
            ref={ref}
            style={style}
            className={classNames(className, "widget-datagrid", {
                "widget-datagrid-exporting": exporting,
                "widget-datagrid-selectable-rows": selectionEnabled,
                "widget-datagrid-selection-method-checkbox": selectionEnabled && selectionMethod === "checkbox",
                "widget-datagrid-selection-method-click": selectionEnabled && selectionMethod === "rowClick"
            })}
        >
            {children}
        </div>
    );
}
