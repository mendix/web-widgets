import classNames from "classnames";
import { CSSProperties, ForwardedRef, forwardRef, PropsWithChildren, useMemo } from "react";
import { constructWrapperStyle, DimensionsProps } from "../utils/dimensions";

export interface SizeProps extends DimensionsProps, PropsWithChildren {
    className: string;
    classNameInner?: string;
    readOnly?: boolean;
    style?: CSSProperties;
    tabIndex?: number;
}

export const SizeContainer = forwardRef(function SizeContainer(props: SizeProps, ref: ForwardedRef<HTMLDivElement>) {
    const {
        className,
        children,
        classNameInner,
        readOnly = false,
        widthUnit,
        width,
        heightUnit,
        height,
        minHeightUnit,
        minHeight,
        maxHeightUnit,
        maxHeight,
        overflowY,
        tabIndex
    } = props;
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
            tabIndex={tabIndex}
        >
            <div className={classNames("size-box-inner", classNameInner)} aria-disabled={readOnly}>
                {children}
            </div>
        </div>
    );
});
