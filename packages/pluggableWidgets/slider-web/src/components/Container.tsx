import { createElement, useRef } from "react";
import { SliderContainerProps } from "../../typings/SliderProps";
import { useNumber } from "../utils/useNumber";
import { Slider as SliderComponent } from "./Slider";
import { useOnChangeDebounced } from "../utils/useOnChangeDebounced";
import { createHandleGenerator } from "../utils/createHandleGenerator";
import { getStyleProp } from "../utils/getStyleProp";
import { useMarks } from "../utils/useMarks";
import { isVertical } from "../utils/isVertical";
import { minProp, maxProp, stepProp } from "../utils/prop-utils";

export function Container(props: SliderContainerProps): React.ReactElement {
    const min = useNumber(minProp(props));
    const max = useNumber(maxProp(props));
    const step = useNumber(stepProp(props));

    if (min.loading || max.loading || step.loading || props.valueAttribute.status === "loading") {
        return <SliderComponent disabled />;
    }

    return <InnerContainer min={min.value} max={max.value} step={step.value} {...props} />;
}

interface InnerContainerProps extends SliderContainerProps {
    min: number | undefined;
    max: number | undefined;
    step: number | undefined;
}

function InnerContainer(props: InnerContainerProps): React.ReactElement {
    const sliderRef = useRef<HTMLDivElement>(null);
    const handle = createHandleGenerator({
        tooltip: props.tooltip,
        showTooltip: props.showTooltip,
        tooltipType: props.tooltipType,
        tooltipAlwaysVisible: props.tooltipAlwaysVisible,
        sliderRef
    });
    const { onChange } = useOnChangeDebounced({ valueAttribute: props.valueAttribute, onChange: props.onChange });
    const marks = useMarks({
        noOfMarkers: props.noOfMarkers,
        decimalPlaces: props.decimalPlaces,
        minValueType: props.minValueType,
        staticMinimumValue: props.staticMaximumValue,
        minAttribute: props.minAttribute,
        expressionMinimumValue: props.expressionMaximumValue,
        maxValueType: props.maxValueType,
        staticMaximumValue: props.staticMaximumValue,
        maxAttribute: props.maxAttribute,
        expressionMaximumValue: props.expressionMaximumValue
    });

    console.log(typeof handle, marks, props.min, props.max);

    return (
        <SliderComponent
            disabled={props.valueAttribute.readOnly}
            rootStyle={getStyleProp({
                orientation: props.orientation,
                height: props.height,
                heightUnit: props.heightUnit
            })}
            vertical={isVertical(props)}
            value={props.valueAttribute.value?.toNumber()}
            min={props.min}
            max={props.max}
            step={props.step}
            onChange={onChange}
            marks={marks}
            handle={handle}
            ref={sliderRef}
        />
    );
}
