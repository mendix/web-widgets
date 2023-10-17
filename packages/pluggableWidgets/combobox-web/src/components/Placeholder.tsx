import classNames from "classnames";
import { PropsWithChildren, ReactElement, createElement } from "react";
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

export function NoOptionsPlaceholder(props: PropsWithChildren): ReactElement {
    return (
        <li className="widget-combobox-item widget-combobox-no-options" role="option">
            {props.children}
        </li>
    );
}

interface InputPlaceholderProps extends PropsWithChildren {
    isEmpty: boolean;
    className?: string;
}
export function InputPlaceholder(props: InputPlaceholderProps): ReactElement {
    return (
        <div
            className={classNames(props.className || "widget-combobox-label-text", {
                "widget-combobox-label-text-placeholder": props.isEmpty
            })}
        >
            {props.children}
        </div>
    );
}
