import { createElement, ReactElement, ReactNode } from "react";

export function WidgetTopBar(props: { children: ReactNode }): ReactElement {
    return <div className="widget-datagrid-top-bar table-header">{props.children}</div>;
}
