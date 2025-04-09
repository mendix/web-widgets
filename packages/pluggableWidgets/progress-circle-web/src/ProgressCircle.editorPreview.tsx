import { createElement, ReactElement } from "react";
import { ProgressCirclePreviewProps } from "../typings/ProgressCircleProps";
import { ProgressCircle } from "./components/ProgressCircle";
import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { defaultValues, ProgressCircleValues } from "./progressCircleValues";
import { calculatePercentage } from "./util";

export function preview(props: ProgressCirclePreviewProps): ReactElement {
    function getProgressCircleValues(): ProgressCircleValues {
        switch (props.type) {
            case "dynamic":
                return {
                    currentValue: asNumber(props.dynamicCurrentValue, defaultValues.currentValue),
                    minValue: asNumber(props.dynamicMinValue, defaultValues.minValue),
                    maxValue: asNumber(props.dynamicMaxValue, defaultValues.maxValue)
                };
            case "expression":
                return {
                    currentValue: asNumber(props.expressionCurrentValue, defaultValues.currentValue),
                    minValue: asNumber(props.expressionMinValue, defaultValues.minValue),
                    maxValue: asNumber(props.expressionMaxValue, defaultValues.maxValue)
                };
            case "static":
                return {
                    currentValue: props.staticCurrentValue ?? defaultValues.currentValue,
                    minValue: props.staticMinValue ?? defaultValues.minValue,
                    maxValue: props.staticMaxValue ?? defaultValues.maxValue
                };
        }
    }

    const { currentValue, minValue, maxValue } = getProgressCircleValues();

    return (
        <ProgressCircle
            class={props.className}
            style={parseStyle(props.style)}
            currentValue={currentValue}
            minValue={minValue}
            maxValue={maxValue}
            onClick={undefined}
            label={
                props.showLabel ? (
                    props.labelType === "custom" ? (
                        <props.customLabel.renderer>
                            <div />
                        </props.customLabel.renderer>
                    ) : props.labelType === "percentage" ? (
                        `${calculatePercentage(currentValue, minValue, maxValue)}%`
                    ) : (
                        props.labelText
                    )
                ) : null
            }
        />
    );
}

function asNumber(value: string, defaultValue: number): number {
    if (!value) {
        return defaultValue;
    }
    const num = Number(value);
    if (isNaN(num)) {
        return defaultValue;
    }

    return num;
}
