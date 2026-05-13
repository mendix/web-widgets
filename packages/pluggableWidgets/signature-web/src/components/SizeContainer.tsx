import classNames from "classnames";
import { CSSProperties, FC, PropsWithChildren, RefObject, useMemo } from "react";
import { useResizeObserver } from "@mendix/widget-plugin-hooks/useResizeObserver";
import { constructWrapperStyle, DimensionsProps } from "../utils/dimensions";
export interface SizeProps extends DimensionsProps, PropsWithChildren {
    className: string;
    classNameInner?: string;
    readOnly?: boolean;
    style?: CSSProperties;
    onResize?: () => void;
}

export const SizeContainer: FC<SizeProps> = (props: SizeProps) => {
    const {
        className,
        children,
        classNameInner,
        readOnly = false,
        onResize,
        widthUnit,
        width,
        heightUnit,
        height,
        minHeightUnit,
        minHeight,
        maxHeightUnit,
        maxHeight,
        overflowY
    } = props;
    const ref = useResizeObserver(() => onResize?.()) as RefObject<HTMLDivElement>;
    const wrapperStyle = useMemo(
        () =>
            constructWrapperStyle({
                widthUnit,
                width,
                heightUnit,
                height,
                minHeightUnit,
                minHeight,
                maxHeightUnit,
                maxHeight,
                overflowY
            }),
        [widthUnit, width, heightUnit, height, minHeightUnit, minHeight, maxHeightUnit, maxHeight, overflowY]
    );
    return (
        <div
            ref={ref}
            className={classNames(className, "size-box")}
            style={{
                position: "relative",
                ...wrapperStyle
            }}
        >
            <div className={classNames("size-box-inner", classNameInner)} aria-disabled={readOnly}>
                {children}
            </div>
        </div>
    );
};
