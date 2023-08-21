import { createElement, ReactElement } from "react";
import { DownArrow } from "../assets/icons";

export function Placeholder(): ReactElement {
    return (
        <div className="form-control widget-combobox-placeholder">
            <div className="widget-combobox-placeholder-down-arrow">
                <DownArrow />
            </div>
        </div>
    );
}
