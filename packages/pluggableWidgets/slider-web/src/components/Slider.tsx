import { createElement, CSSProperties, forwardRef, RefObject } from "react";
import RcSlider, { SliderProps as RcSliderProps } from "rc-slider";
import classNames from "classnames";

export interface SliderProps extends RcSliderProps {
    classNameSlider?: string;
    rootStyle?: CSSProperties;
    sliderRef?: RefObject<HTMLDivElement>;
}

export const Slider = forwardRef(
    ({ className, classNameSlider, rootStyle, sliderRef, ...rcSliderProps }: SliderProps): JSX.Element => {
        return (
            <div
                ref={sliderRef}
                style={rootStyle}
                className={classNames(
                    "widget-slider",
                    {
                        "widget-slider-vertical": rcSliderProps.vertical
                    },
                    className
                )}
            >
                <RcSlider className={classNameSlider} {...rcSliderProps} />
            </div>
        );
    }
);
