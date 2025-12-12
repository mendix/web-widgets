import { CSSProperties, forwardRef, ReactElement, RefObject } from "react";
import Slider, { SliderProps } from "@rc-component/slider";
import classNames from "classnames";
export interface RangeSliderProps extends SliderProps {
    classNameSlider?: string;
    rootStyle?: CSSProperties;
}

export const RangeSlider = forwardRef(
    (
        { className, classNameSlider, rootStyle, ...rcRangeProps }: RangeSliderProps,
        sliderRef: RefObject<HTMLDivElement>
    ): ReactElement => (
        <div
            ref={sliderRef}
            style={rootStyle}
            className={classNames(
                "widget-range-slider",
                {
                    "widget-range-slider-vertical": rcRangeProps.vertical
                },
                className
            )}
        >
            <Slider range className={classNameSlider} {...rcRangeProps} />
        </div>
    )
);
