import classNames from "classnames";
import { PropsWithChildren, ReactElement } from "react";
import { classes } from "./classes";
import { legacy } from "./legacyModifiers";
import { DownArrow } from "../assets/icons";

/** Rendered by the widget while it has no context yet. Not part of the View, so it keeps its own classes. */
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
        <li className={classNames(classes.menuItem, classes.noOptions)} role="option">
            {props.children}
        </li>
    );
}

interface InputPlaceholderProps extends PropsWithChildren {
    isEmpty: boolean;
    /** The input area shows custom content, laid out as a block instead of one line of text. */
    custom?: boolean;
}
/** What the input area shows while nothing is typed: the selected caption or custom content. */
export function InputPlaceholder({ isEmpty, custom, children }: InputPlaceholderProps): ReactElement {
    return (
        <div
            className={classNames(classes.placeholder, {
                [legacy.placeholderCustom]: custom,
                [legacy.placeholderEmpty]: isEmpty
            })}
            data-custom={custom || undefined}
            data-empty={isEmpty || undefined}
        >
            {children}
        </div>
    );
}
