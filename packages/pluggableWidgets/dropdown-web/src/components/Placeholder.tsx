import { createElement, ReactElement } from "react";

export function Placeholder(): ReactElement {
    return (
        <div className="widget-dropdown">
            <div className="widget-dropdown-placeholder form-control">&nbsp;</div>
        </div>
    );
}
