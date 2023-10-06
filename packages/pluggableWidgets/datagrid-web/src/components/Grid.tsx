import { ReactElement, createElement, Fragment } from "react";
import { StickyHeaderTable } from "./StickyHeaderTable";

type P = Omit<JSX.IntrinsicElements["div"], "className" | "role" | "ref">;

export interface GridProps extends P {}

export function Grid(props: GridProps): ReactElement {
    const { children, ...rest } = props;

    return (
        <Fragment>
            <StickyHeaderTable />
            <div className="table" role="grid" {...rest}>
                {children}
            </div>
        </Fragment>
    );
}
