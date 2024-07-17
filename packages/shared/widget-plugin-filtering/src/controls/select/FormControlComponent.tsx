import { createElement, ReactElement } from "react";
import { preventReactErrorsAboutReadOnly } from "../utils/helper";

interface FormControlProps {
    ariaLabel?: string;
    status?: JSX.Element;
    id?: string;
    inputValue: string;
    placeholder?: string;
    onContainerClick?: () => void;
    show: boolean;
}

export function FormControlComponent(props: FormControlProps): ReactElement {
    const { ariaLabel, status, id, inputValue, placeholder, onContainerClick, show } = props;

    if (status) {
        return status;
    }

    return (
        <input
            value={inputValue}
            placeholder={placeholder}
            className="form-control dropdown-triggerer"
            onClick={onContainerClick}
            onChange={preventReactErrorsAboutReadOnly}
            onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onContainerClick) {
                        onContainerClick();
                    }
                }
            }}
            aria-haspopup
            aria-expanded={show}
            aria-controls={`${id}-dropdown-list`}
            aria-label={ariaLabel}
        />
    );
}
