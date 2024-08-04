import { createElement, useRef, useMemo } from "react";
import { RangeSliderContainerProps } from "../../typings/RangeSliderProps";
import { useNumber } from "../utils/useNumber";
import { RangeSlider as RangeComponent } from "./RangeSlider";
import { useOnChangeDebounced } from "../utils/useOnChangeDebounced";
import { createHandleGenerator } from "../utils/createHandleGenerator";
import { useMarks } from "../utils/useMarks";
import { minProp, maxProp, stepProp, isVertical, getStyleProp } from "../utils/prop-utils";
import { useScheduleUpdateOnce } from "@mendix/widget-plugin-hooks/useScheduleUpdateOnce";

export function Container(props: RangeSliderContainerProps): React.ReactElement {
    const min = useNumber(minProp(props));
    const max = useNumber(maxProp(props));
    const step = useNumber(stepProp(props));

    if (
        min.loading ||
        max.loading ||
        step.loading ||
        props.lowerBoundAttribute.status === "loading" ||
        props.upperBoundAttribute.status === "loading"
    ) {
        return <RangeComponent disabled />;
    }

    return <InnerContainer min={min.value} max={max.value} step={step.value} {...props} />;
}

interface InnerContainerProps extends RangeSliderContainerProps {
    min: number | undefined;
    max: number | undefined;
    step: number | undefined;
}

function InnerContainer(props: InnerContainerProps): React.ReactElement {
    const sliderRef = useRef<HTMLDivElement>(null);
    const { lowerBoundAttribute, upperBoundAttribute, min = 0, max = 100 } = props;
    const lowerValue = lowerBoundAttribute?.value?.toNumber() ?? min;
    const upperValue = upperBoundAttribute?.value?.toNumber() ?? max;
    const value = useMemo(() => [lowerValue, upperValue], [lowerValue, upperValue]);

    const { onChange } = useOnChangeDebounced({ lowerBoundAttribute, upperBoundAttribute, onChange: props.onChange });

    const marks = useMarks({
        noOfMarkers: props.noOfMarkers,
        decimalPlaces: props.decimalPlaces,
        min,
        max
    });

    const style = getStyleProp({
        orientation: props.orientation,
        height: props.height,
        heightUnit: props.heightUnit
    });

    const handle = createHandleGenerator({
        tooltipLower: props.tooltipLower,
        tooltipUpper: props.tooltipUpper,
        showTooltip: props.showTooltip,
        tooltipTypeLower: props.tooltipTypeLower,
        tooltipTypeUpper: props.tooltipTypeUpper,
        tooltipAlwaysVisible: props.tooltipAlwaysVisible,
        sliderRef
    });

    useScheduleUpdateOnce(() => lowerBoundAttribute.status === "available");

    return (
        <RangeComponent
            allowCross={false}
            disabled={lowerBoundAttribute.readOnly || upperBoundAttribute.readOnly}
            rootStyle={style}
            vertical={isVertical(props)}
            step={props.step}
            onChange={onChange}
            value={value}
            marks={marks}
            min={props.min}
            max={props.max}
            handle={handle}
            ref={sliderRef}
        />
    );
}
