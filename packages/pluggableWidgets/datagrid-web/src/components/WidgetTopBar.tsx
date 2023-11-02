import { createElement, ReactElement } from "react";

export function WidgetTopBar(props: JSX.IntrinsicElements["div"]): ReactElement {
    return (
        <div {...props} className="widget-datagrid-top-bar table-header">
            {props.children}
        </div>
    );
}
