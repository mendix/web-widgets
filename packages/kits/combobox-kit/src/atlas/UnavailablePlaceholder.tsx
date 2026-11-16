import { ReactElement } from "react";
import { DownArrow } from "./icons";

/** Rendered by the widget while it has no context yet. Not part of the View, so it keeps its own classes. */
export function UnavailablePlaceholder(): ReactElement {
    return (
        <div className="form-control widget-combobox-placeholder">
            <div className="widget-combobox-placeholder-down-arrow">
                <DownArrow />
            </div>
        </div>
    );
}
