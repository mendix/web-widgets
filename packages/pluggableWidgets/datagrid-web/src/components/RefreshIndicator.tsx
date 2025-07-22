import classNames from "classnames";
import { createElement, ReactElement } from "react";

export function RefreshIndicator({ show }: { show: boolean }): ReactElement {
    return (
        <div className="tr" role="row">
            <div
                className={classNames("th widget-datagrid-refresh-container", {
                    "widget-datagrid-refresh-container--hidden": !show
                })}
            >
                <progress className="widget-datagrid-refresh-indicator" />
            </div>
        </div>
    );
}
