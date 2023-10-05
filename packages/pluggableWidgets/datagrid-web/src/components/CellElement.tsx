import classNames from "classnames";
import { createElement, ReactNode, ReactElement, memo, DOMAttributes } from "react";
import { AlignmentEnum } from "typings/DatagridProps";

interface CellElementProps {
    className?: string;
    borderTop?: boolean;
    previewAsHidden?: boolean;
    onClick?: DOMAttributes<HTMLDivElement>["onClick"];
    onKeyDown?: DOMAttributes<HTMLDivElement>["onKeyDown"];
    clickable?: boolean;
    children?: ReactNode;
    alignment?: AlignmentEnum;
    wrapText?: boolean;
    ["aria-hidden"]?: boolean;
    tabIndex?: number;
}

// eslint-disable-next-line prefer-arrow-callback
const component = memo(function CellElement(props: CellElementProps): ReactElement {
    return (
        <div
            className={classNames(
                "td",
                {
                    "td-borders": props.borderTop,
                    clickable: props.clickable,
                    "hidden-column-preview": props.previewAsHidden,
                    "wrap-text": props.wrapText,
                    [`align-column-${props.alignment}`]: typeof props.alignment === "string"
                },
                props.className
            )}
            onClick={props.onClick}
            onKeyDown={props.onKeyDown}
            role="gridcell"
            tabIndex={props.tabIndex ?? (props.clickable ? 0 : undefined)}
        >
            {props.children}
        </div>
    );
});

// Override react NamedExoticComponent.
export const CellElement = component as (props: CellElementProps) => ReactElement;
