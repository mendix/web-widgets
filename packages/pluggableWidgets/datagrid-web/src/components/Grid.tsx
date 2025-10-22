import classNames from "classnames";
import { JSX, ReactElement, RefObject } from "react";

type P = Omit<JSX.IntrinsicElements["div"], "role" | "ref">;

export interface GridProps extends P {
    className?: string;
    isInfinite: boolean;
    containerRef: RefObject<HTMLDivElement | null>;
    bodyHeight?: string;
    gridWidth?: string;
    scrollBarSize?: string;
}

export function Grid(props: GridProps): ReactElement {
    const { className, style, children, isInfinite, bodyHeight, gridWidth, containerRef, scrollBarSize, ...rest } =
        props;

    return (
        <div
            className={classNames("widget-datagrid-grid table", { "infinite-loading": isInfinite }, className)}
            role="grid"
            style={{
                ...style,
                ...({
                    "--mx-grid-width": gridWidth,
                    "--mx-grid-body-height": bodyHeight,
                    "--mx-grid-scrollbar-size": scrollBarSize
                } as any)
            }}
            ref={containerRef}
            {...rest}
        >
            {children}
        </div>
    );
}
