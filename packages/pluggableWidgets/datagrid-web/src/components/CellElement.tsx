import classNames from "classnames";
import { createElement, ReactNode, ReactElement, memo, DOMAttributes, forwardRef } from "react";
import { AlignmentEnum } from "typings/DatagridProps";

export type CellElementProps = {
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
} & Omit<JSX.IntrinsicElements["div"], "ref" | "children">;

const component = // eslint-disable-next-line prefer-arrow-callback
    forwardRef<HTMLDivElement, CellElementProps>(function CellElement(
        { className, borderTop, clickable, previewAsHidden, wrapText, alignment, tabIndex, ...rest }: CellElementProps,
        ref
    ): ReactElement {
        return (
            <div
                className={classNames(
                    "td",
                    {
                        "td-borders": borderTop,
                        clickable,
                        "hidden-column-preview": previewAsHidden,
                        "wrap-text": wrapText,
                        [`align-column-${alignment}`]: typeof alignment === "string"
                    },
                    className
                )}
                role="gridcell"
                tabIndex={tabIndex ?? (clickable ? 0 : undefined)}
                ref={ref}
                {...rest}
            />
        );
    });

export const CellElement = memo(component);
