import { ReactElement, createElement } from "react";

export function Placeholder(): ReactElement {
    return (
        <div className="form-control widget-selection-controls-placeholder">
            <div className="widget-selection-controls-placeholder-content">Loading...</div>
        </div>
    );
}
