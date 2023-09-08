import { createElement, CSSProperties, ReactElement, ReactNode, useMemo } from "react";
import { ThreeStateCheckBox } from "@mendix/widget-plugin-grid/components/ThreeStateCheckBox";

interface Props {
    type: "checkbox" | "custom";
    status: "all" | "some" | "none";
    onClick?: () => void;
    children: ReactNode;
    className: string;
    cssStyles?: CSSProperties;
}

export function SelectionHelperComponent(props: Props): ReactElement {
    const id = useMemo(() => {
        return Date.now().toString();
    }, []);

    return (
        <div className={`widget-selection-helper ${props.className}`} style={props.cssStyles}>
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
                    <ThreeStateCheckBox id={id} value={props.status} onChange={props.onClick} />
                    <label htmlFor={id} className="control-label">
                        {props.children}
                    </label>
                </div>
            )}
        </div>
    );
}
