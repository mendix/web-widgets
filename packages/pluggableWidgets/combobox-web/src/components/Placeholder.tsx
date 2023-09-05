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

export function EmptyItemPlaceholder(props: PropsWithChildren): ReactElement {
    return (
        <li className="widget-combobox-item widget-combobox-empty-item" role="option">
            {props.children}
        </li>
    );
}

interface InputPlaceholderProps extends PropsWithChildren {
    isEmpty: boolean;
}
export function InputPlaceholder(props: InputPlaceholderProps): ReactElement {
    return (
        <span
            className={classNames("widget-combobox-text-label", {
                "widget-combobox-text-label-placeholder": props.isEmpty
            })}
        >
            {props.children}
        </span>
    );
}
