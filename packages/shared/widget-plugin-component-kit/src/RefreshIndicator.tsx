import { createElement, ReactElement } from "react";

export function RefreshIndicator(): ReactElement {
    return (
        <div className="tr" role="row">
            <div className="th mx-refresh-container">
                <progress className="mx-refresh-indicator" />
            </div>
        </div>
    );
}
