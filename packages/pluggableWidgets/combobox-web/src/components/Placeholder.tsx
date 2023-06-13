import { createElement, ReactElement } from "react";

export function Placeholder(): ReactElement {
    return (
        <div className="widget-combobox">
            <div className="widget-combobox-placeholder form-control">&nbsp;</div>
        </div>
    );
}
