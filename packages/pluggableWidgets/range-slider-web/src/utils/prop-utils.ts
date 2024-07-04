import { CSSProperties } from "react";
import { EditableValue, DynamicValue } from "mendix";
import { RangeSliderContainerProps } from "../../typings/RangeSliderProps";

export function minProp(props: RangeSliderContainerProps): Big | EditableValue<Big> | DynamicValue<Big> | undefined {
    switch (props.minValueType) {
        case "static":
            return props.staticMinimumValue;
        case "dynamic":
            return props.minAttribute;
        case "expression":
            return props.expressionMinimumValue;
        default:
            return undefined;
    }
}

export function maxProp(props: RangeSliderContainerProps): Big | EditableValue<Big> | DynamicValue<Big> | undefined {
    switch (props.maxValueType) {
        case "static":
            return props.staticMaximumValue;
        case "dynamic":
            return props.maxAttribute;
        case "expression":
            return props.expressionMaximumValue;
        default:
            return undefined;
    }
}

export function stepProp(props: RangeSliderContainerProps): Big | EditableValue<Big> | DynamicValue<Big> | undefined {
    switch (props.stepSizeType) {
        case "static":
            return props.stepValue;
        case "dynamic":
            return props.stepAttribute;
        case "expression":
            return props.expressionStepSize;
        default:
            return undefined;
    }
}

export function isVertical(params: Pick<RangeSliderContainerProps, "orientation">): boolean {
    return params.orientation === "vertical";
}

export function getStyleProp({
    orientation,
    height,
    heightUnit,
    style
}: {
    orientation: "vertical" | "horizontal";
    height: number;
    heightUnit: "pixels" | "percentage";
    style?: CSSProperties;
}): CSSProperties | undefined {
    if (orientation === "vertical") {
        const rootHeight = `${height}${heightUnit === "pixels" ? "px" : "%"}`;
        return {
            ...style,
            height: rootHeight
        };
    }

    return style;
}
