import { ReactElement, createElement } from "react";

export function Placeholder(): ReactElement {
    return (
        <div className="form-control widget-selection-controls-placeholder">
            <div className="widget-selection-controls-placeholder-content">Loading...</div>
        </div>
    );
}

export function NoOptionsPlaceholder(): ReactElement {
    return <div className="widget-selection-controls-no-options">No options available</div>;
}
