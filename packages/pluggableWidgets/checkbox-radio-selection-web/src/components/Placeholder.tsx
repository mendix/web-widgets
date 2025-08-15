import { ReactElement, createElement } from "react";

export function Placeholder({ emptyOptionText }: { emptyOptionText: string }): ReactElement {
    return (
        <div className="form-control widget-checkbox-radio-selection-placeholder">
            <div className="widget-checkbox-radio-selection-placeholder-content">{emptyOptionText}</div>
        </div>
    );
}
