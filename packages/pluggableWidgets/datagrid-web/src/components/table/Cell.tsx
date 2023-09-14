import classNames from "classnames";
import { createElement, ReactNode, ReactElement, memo, DOMAttributes } from "react";

interface CellProps {
    className?: string;
    borderTop?: boolean;
    previewAsHidden?: boolean;
    onClick?: DOMAttributes<HTMLDivElement>["onClick"];
    onKeyDown?: DOMAttributes<HTMLDivElement>["onKeyDown"];
    children?: ReactNode;
    ["aria-hidden"]?: boolean;
    ["data-row"]?: number;
}

// eslint-disable-next-line prefer-arrow-callback
export const Cell = memo(function Cell(props: CellProps): ReactElement {
    const clickable = !!props.onClick;
    console.info(props["data-row"], "render");
    return (
        <div
            data-next="yes"
            className={classNames("td", { "td-borders": props.borderTop }, props.className, {
                clickable,
                "hidden-column-preview": props.previewAsHidden
            })}
            onClick={props.onClick}
            onKeyDown={props.onKeyDown}
            role={clickable ? "button" : "cell"}
            tabIndex={clickable ? 0 : undefined}
        >
            {props.children}
        </div>
    );
});
