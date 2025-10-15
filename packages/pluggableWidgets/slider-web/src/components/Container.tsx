import { ReactElement, useRef } from "react";
import { SliderContainerProps } from "../../typings/SliderProps";
import { createHandleRender } from "../utils/createHandleRender";
import { getStyleProp, isVertical, maxProp, minProp, stepProp } from "../utils/prop-utils";
import { useMarks } from "../utils/useMarks";
import { useNumber } from "../utils/useNumber";
import { useOnChangeDebounced } from "../utils/useOnChangeDebounced";
import { Slider as SliderComponent } from "./Slider";

export function Container(props: SliderContainerProps): ReactElement {
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

function InnerContainer(props: InnerContainerProps): ReactElement {
    const sliderRef = useRef<HTMLDivElement>(null);
    const handleRender = createHandleRender({
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
        min: props.min,
        max: props.max
    });

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
            handleRender={handleRender}
            ref={sliderRef}
        />
    );
}
