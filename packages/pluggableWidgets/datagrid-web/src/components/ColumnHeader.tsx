import classNames from "classnames";
import { HTMLAttributes, ReactElement, ReactNode } from "react";

export interface ColumnHeaderProps {
    children?: ReactNode;
    sortProps?: HTMLAttributes<HTMLDivElement> | null;
    canSort: boolean;
    caption: string;
    isDragging?: [string | undefined, string, string | undefined] | undefined;
    columnAlignment?: "left" | "center" | "right";
}

export default function ColumnHeader(props: ColumnHeaderProps): ReactElement {
    return (
        <div
            className={classNames(
                "column-header",
                { clickable: props.canSort },
                `align-column-${props.columnAlignment}`
            )}
            style={{ pointerEvents: props.isDragging ? "none" : undefined }}
            {...props.sortProps}
            aria-label={props.canSort ? "sort " + props.caption : props.caption}
        >
            <span>{props.caption.length > 0 ? props.caption : "\u00a0"}</span>
            {props.children}
        </div>
    );
}
