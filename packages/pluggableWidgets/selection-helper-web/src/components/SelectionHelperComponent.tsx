import { createElement, ReactElement, ReactNode, useMemo } from "react";
import { CheckBox } from "./CheckBox";

interface Props {
    type: "checkbox" | "custom";
    status: "all" | "some" | "none";
    onClick?: () => void;
    children: ReactNode;
}

export function SelectionHelperComponent(props: Props): ReactElement {
    const id = useMemo(() => {
        return Date.now().toString();
    }, []);

    return (
        <div className="widget-selection-helper">
            {props.type === "custom" ? (
                <div
                    className="selection-helper-custom"
                    onClick={props.onClick}
                    onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            props.onClick?.();
                        }
                    }}
                >
                    {props.children}
                </div>
            ) : (
                <div className="selection-helper-checkbox mx-checkbox form-group label-after">
                    <CheckBox id={id} value={props.status} onChange={props.onClick} />
                    <label htmlFor={id} className="control-label">
                        {props.children}
                    </label>
                </div>
            )}
        </div>
    );
}
