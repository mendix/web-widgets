import { FunctionComponent, useCallback } from "react";
import { ProgressBarContainerProps } from "../typings/ProgressBarProps";
import { ProgressBar as ProgressBarComponent } from "./components/ProgressBar";
import { defaultValues, ProgressBarValues } from "./progressBarValues";
import { calculatePercentage } from "./util";

export const ProgressBar: FunctionComponent<ProgressBarContainerProps> = props => {
    function getProgressBarValues(): ProgressBarValues {
        switch (props.type) {
            case "dynamic":
                return {
                    currentValue: Number(props.dynamicCurrentValue?.value ?? 0),
                    minValue: Number(props.dynamicMinValue?.value ?? defaultValues.minValue),
                    maxValue: Number(props.dynamicMaxValue?.value ?? defaultValues.maxValue)
                };
            case "expression":
                return {
                    currentValue: Number(props.expressionCurrentValue?.value ?? 0),
                    minValue: Number(props.expressionMinValue?.value ?? defaultValues.minValue),
                    maxValue: Number(props.expressionMaxValue?.value ?? defaultValues.maxValue)
                };
            case "static":
                // Default values here are handled by the `ProgressBar.xml`.
                return {
                    currentValue: props.staticCurrentValue,
                    minValue: props.staticMinValue,
                    maxValue: props.staticMaxValue
                };
        }
    }

    const { currentValue, minValue, maxValue } = getProgressBarValues();
    const onClick = useCallback(() => props.onClick?.execute(), [props.onClick]);
    return (
        <ProgressBarComponent
            class={props.class}
            style={props.style}
            currentValue={currentValue}
            minValue={minValue}
            maxValue={maxValue}
            onClick={props.onClick ? onClick : undefined}
            label={
                props.showLabel
                    ? props.labelType === "custom"
                        ? props.customLabel
                        : props.labelType === "percentage"
                          ? `${calculatePercentage(currentValue, minValue, maxValue)}%`
                          : props.labelText?.value
                    : null
            }
        />
    );
};
