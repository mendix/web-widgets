import { ReactElement, useMemo, useRef } from "react";
import { RangeSliderContainerProps } from "../../typings/RangeSliderProps";
import { useNumber } from "../utils/useNumber";
import { RangeSlider as RangeComponent } from "./RangeSlider";
import { useOnChangeDebounced } from "../utils/useOnChangeDebounced";
import { useMarks } from "../utils/useMarks";
import { getStyleProp, isVertical, maxProp, minProp, stepProp } from "../utils/prop-utils";
import { useScheduleUpdateOnce } from "@mendix/widget-plugin-hooks/useScheduleUpdateOnce";
import { HandleTooltip } from "./TooltipHandler";

export function Container(props: RangeSliderContainerProps): ReactElement {
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

function InnerContainer(props: InnerContainerProps): ReactElement {
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

    const tooltipTypeCheck = [props.tooltipTypeLower, props.tooltipTypeUpper];
    const tooltipValue = [props.tooltipLower, props.tooltipUpper];

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
            handleRender={(node, handleProps) => {
                const isCustomText = tooltipTypeCheck[handleProps.index] === "customText";
                const displayValue = isCustomText ? (tooltipValue[handleProps.index]?.value ?? "") : handleProps.value;
                return (
                    <HandleTooltip
                        value={displayValue}
                        index={handleProps.index}
                        visible={handleProps.dragging}
                        sliderRef={sliderRef}
                        {...props}
                    >
                        {node}
                    </HandleTooltip>
                );
            }}
            ref={sliderRef}
        />
    );
}
