import { createElement, CSSProperties, FC, PropsWithChildren } from "react";
import classNames from "classnames";
import { useResizeObserver } from "../utils/useResizeObserver";
// import { Dimensions, HeightUnitType, WidthUnitType } from "../utils/customTypes";
import { constructWrapperStyle, DimensionsProps } from "../utils/dimensions";

export interface SizeProps extends DimensionsProps, PropsWithChildren {
    className: string;
    classNameInner?: string;
    readOnly?: boolean;
    style?: CSSProperties;
    onResize?: () => void;
}

export const SizeContainer: FC<SizeProps> = (props: SizeProps) => {
    const { className, children, classNameInner, readOnly = false, style, onResize } = props;
    const ref = useResizeObserver(() => onResize?.());

    // const styleWidth = widthUnit === "percentage" ? `${width}%` : `${width}px`;
    const wrapperStyle = constructWrapperStyle(props);
    return createElement(
        "div",
        {
            ref,
            className: classNames(className, "size-box"),
            style: {
                position: "relative",
                ...wrapperStyle,
                ...style
            }
        },
        createElement(
            "div",
            {
                className: classNames("size-box-inner", classNameInner),
                readOnly,
                disabled: readOnly,
                style: {
                    position: "absolute",
                    top: "0",
                    right: "0",
                    bottom: "0",
                    left: "0"
                }
            },
            children
        )
    );
};

SizeContainer.displayName = "SizeContainer";

// const getHeight = (
//     heightUnit: HeightUnitType,
//     height: number,
//     widthUnit: WidthUnitType,
//     width: number
// ): CSSProperties => {
//     const style: CSSProperties = {};
//     if (heightUnit === "percentageOfWidth") {
//         const ratio = (height / 100) * width;
//         if (widthUnit === "percentage") {
//             style.height = "auto";
//             style.paddingBottom = `${ratio}%`;
//         } else {
//             style.height = `${ratio}px`;
//         }
//     } else if (heightUnit === "pixels") {
//         style.height = `${height}px`;
//     } else if (heightUnit === "percentageOfParent") {
//         style.height = `${height}%`;
//     }

//     return style;
// };
