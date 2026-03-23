import { createElement, CSSProperties, FC, PropsWithChildren } from "react";
import classNames from "classnames";
import { useResizeObserver } from "../utils/useResizeObserver";
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
