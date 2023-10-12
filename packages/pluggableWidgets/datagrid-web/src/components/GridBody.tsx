import classNames from "classnames";
import { createElement, ReactElement, ReactNode } from "react";

type Props = Omit<JSX.IntrinsicElements["div"], "ref"> & {
    children?: ReactNode;
};

export function GridBody(props: Props): ReactElement {
    return (
        <div
            {...props}
            className={classNames("widget-datagrid-grid-body table-content", props.className)}
            role="rowgroup"
        />
    );
}
