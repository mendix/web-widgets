import { createElement, ReactElement } from "react";

export function RefreshIndicator(): ReactElement {
    return (
        <div className="tr" role="row">
            <div className="th widget-datagrid-refresh-container">
                <progress className="widget-datagrid-refresh-indicator" />
            </div>
        </div>
    );
}
