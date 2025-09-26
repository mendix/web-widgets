import classNames from "classnames";
import { createElement, JSX, ReactElement } from "react";

type P = Omit<JSX.IntrinsicElements["div"], "role" | "ref">;

export interface GridProps extends P {
    className?: string;
}

export function Grid(props: GridProps): ReactElement {
    const { className, style, children, ...rest } = props;

    return (
        <div className={classNames("widget-datagrid-grid table", className)} role="grid" style={style} {...rest}>
            {children}
        </div>
    );
}
