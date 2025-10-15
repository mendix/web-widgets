import { CSSProperties, forwardRef, ReactElement, RefObject } from "react";
import RcSlider, { SliderProps as RcSliderProps } from "@rc-component/slider";
import "@rc-component/slider/assets/index.css";
import classNames from "classnames";

export interface SliderProps extends RcSliderProps {
    classNameSlider?: string;
    rootStyle?: CSSProperties;
}

export const Slider = forwardRef(
    (
        { className, classNameSlider, rootStyle, ...rcSliderProps }: SliderProps,
        sliderRef: RefObject<HTMLDivElement>
    ): ReactElement => {
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
