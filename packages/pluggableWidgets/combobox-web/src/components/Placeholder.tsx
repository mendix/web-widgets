import classNames from "classnames";
import { PropsWithChildren, ReactElement, createElement, Fragment } from "react";
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
    useWrapper?: boolean;
}
export function InputPlaceholder(props: InputPlaceholderProps): ReactElement {
    if (props.useWrapper === false) {
        return <Fragment>{props.children}</Fragment>;
    }

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
