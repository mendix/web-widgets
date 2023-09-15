import classNames from "classnames";
import { createElement, ReactNode, ReactElement, memo, DOMAttributes } from "react";
import { AlignmentEnum } from "typings/DatagridProps";

interface CellElementProps {
    className?: string;
    borderTop?: boolean;
    previewAsHidden?: boolean;
    onClick?: DOMAttributes<HTMLDivElement>["onClick"];
    onKeyDown?: DOMAttributes<HTMLDivElement>["onKeyDown"];
    children?: ReactNode;
    alignment?: AlignmentEnum;
    wrapText?: boolean;
    ["aria-hidden"]?: boolean;
}

const component = memo((props: CellElementProps) => {
    const clickable = !!props.onClick;
    return (
        <div
            data-next="yes"
            className={classNames(
                "td",
                {
                    "td-borders": props.borderTop,
                    clickable,
                    "hidden-column-preview": props.previewAsHidden,
                    "wrap-text": props.wrapText,
                    [`align-column-${props.alignment}`]: typeof props.alignment === "string"
                },
                props.className
            )}
            onClick={props.onClick}
            onKeyDown={props.onKeyDown}
            role={clickable ? "button" : "cell"}
            tabIndex={clickable ? 0 : undefined}
        >
            {props.children}
        </div>
    );
});

component.displayName = "CellElement";

// Override react NamedExoticComponent.
export const CellElement = component as (props: CellElementProps) => ReactElement;
