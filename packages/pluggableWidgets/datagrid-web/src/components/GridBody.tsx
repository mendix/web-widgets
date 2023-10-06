import { ReactElement, createElement, Fragment } from "react";
import { StickyHeaderTable } from "./StickyHeaderTable";

type P = Omit<JSX.IntrinsicElements["div"], "className" | "role" | "ref">;

export interface GridBodyProps extends P {}

export function GridBody(props: GridBodyProps): ReactElement {
    const { children, ...rest } = props;

    return (
        <Fragment>
            <StickyHeaderTable />
            <div className="widget-datagrid-grid-body table" role="grid" {...rest}>
                {children}
            </div>
        </Fragment>
    );
}
