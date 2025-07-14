import { ReactElement, createElement } from "react";

export function Placeholder(): ReactElement {
    return (
        <div className="form-control widget-checkbox-radio-selection-placeholder">
            <div className="widget-checkbox-radio-selection-placeholder-content">Loading...</div>
        </div>
    );
}
