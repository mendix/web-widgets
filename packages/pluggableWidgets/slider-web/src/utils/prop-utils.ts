import { EditableValue, DynamicValue } from "mendix";
import { SliderContainerProps } from "../../typings/SliderProps";

export function minProp(props: SliderContainerProps): Big | EditableValue<Big> | DynamicValue<Big> | undefined {
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

export function maxProp(props: SliderContainerProps): Big | EditableValue<Big> | DynamicValue<Big> | undefined {
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

export function stepProp(props: SliderContainerProps): Big | EditableValue<Big> | DynamicValue<Big> | undefined {
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
