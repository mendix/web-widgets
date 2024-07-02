import classNames from "classnames";
import { ReactElement, createElement, useRef, useMemo } from "react";
import { SelectionMethod } from "../helpers/SelectActionHelper";

type P = JSX.IntrinsicElements["div"];

export interface WidgetRootProps extends P {
    className?: string;
    selection?: boolean;
    selectionMethod: SelectionMethod;
    exporting?: boolean;
}

export function WidgetRoot(props: WidgetRootProps): ReactElement {
    const ref = useRef<HTMLDivElement>(null);
    const { className, selectionMethod, selection, exporting, children, ...rest } = props;
    const style = useMemo(() => {
        const s = { ...props.style };
        if (exporting && ref.current) {
            s.height = ref.current.offsetHeight;
        }
        return s;
    }, [props.style, exporting]);

    return (
        <div
            {...rest}
            ref={ref}
            style={style}
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
