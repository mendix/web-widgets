import { ReactNode } from "react";
import { createMarks } from "@mendix/widget-plugin-platform/utils/slider-marks";
import { RangeSliderPreviewProps } from "../typings/RangeSliderProps";
import { RangeSlider } from "./components/RangeSlider";
import { getPreviewValues } from "./utils/getPreviewValues";
import { getStyleProp, isVertical } from "./utils/prop-utils";

export function getPreviewCss(): string {
    return require("./ui/RangeSlider.scss");
}

export function preview(props: RangeSliderPreviewProps): ReactNode {
    const { min, max, step, value } = getPreviewValues(props);
    const decimalPlaces = props.decimalPlaces ?? 0;
    const marks = createMarks({
        min,
        max,
        numberOfMarks: props.noOfMarkers ?? 1,
        decimalPlaces,
        format: (v: number) => v.toFixed(decimalPlaces)
    });

    const style = getStyleProp({
        orientation: props.orientation,
        height: props.height ?? 100,
        heightUnit: props.heightUnit
    });

    return (
        <RangeSlider
            disabled={props.readOnly}
            value={value}
            marks={marks}
            min={min}
            max={max}
            step={step}
            rootStyle={style}
            vertical={isVertical(props)}
        />
    );
}
