import classNames from "classnames";
import { JSX, ReactElement, RefObject } from "react";

type P = Omit<JSX.IntrinsicElements["div"], "role" | "ref">;

export interface GridProps extends P {
    className?: string;
    isInfinite: boolean;
    containerRef: RefObject<HTMLDivElement | null>;
}

export function Grid(props: GridProps): ReactElement {
    const { className, style, children, isInfinite, containerRef, ...rest } = props;

    return (
        <div
            className={classNames("widget-datagrid-grid table", { "infinite-loading": isInfinite }, className)}
            role="grid"
            style={style}
            ref={containerRef}
            {...rest}
        >
            {children}
        </div>
    );
}
