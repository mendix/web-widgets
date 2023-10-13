import classNames from "classnames";
import { ReactElement, createElement } from "react";

type P = Omit<JSX.IntrinsicElements["div"], "role" | "ref">;

export interface GridProps extends P {}

export function Grid(props: GridProps): ReactElement {
    const { children, className, ...rest } = props;

    return (
        <div className={classNames("widget-datagrid-grid table", className)} role="grid" {...rest}>
            {children}
        </div>
    );
}
