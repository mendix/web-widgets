import { CSSProperties, FC, PropsWithChildren } from "react";
import classNames from "classnames";
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
    const { className, children, classNameInner, readOnly = false, style, onResize } = props;
    const ref = useResizeObserver(() => onResize?.()) as React.RefObject<HTMLDivElement>;
    const wrapperStyle = constructWrapperStyle(props);

    return (
        <div
            ref={ref}
            className={classNames(className, "size-box")}
            style={{
                position: "relative",
                ...wrapperStyle,
                ...style
            }}
        >
            <div
                className={classNames("size-box-inner", classNameInner)}
                aria-disabled={readOnly}
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }}
            >
                {children}
            </div>
        </div>
    );
};

SizeContainer.displayName = "SizeContainer";
