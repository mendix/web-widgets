interface ParameterTypeProps {
    componentLoadDelayParameterType: string;
    componentLoadRepeatIntervalParameterType: string;
    onEventChangeDelayParameterType: string;
    componentLoadDelay?: number;
    componentLoadRepeatInterval?: number;
    onEventChangeDelay?: number;
    componentLoadRepeatIntervalExpression?: { status: string; value: { toNumber: () => number } | undefined };
    componentLoadDelayExpression?: { status: string; value: { toNumber: () => number } | undefined };
    onEventChangeDelayExpression?: { status: string; value: { toNumber: () => number } | undefined };
}

export function useDelayAndInterval(props: ParameterTypeProps): [number | undefined, number | undefined] {
    let delayValue: number | undefined;
    let intervalValue: number | undefined;
    const {
        componentLoadDelayParameterType,
        componentLoadRepeatIntervalParameterType,
        onEventChangeDelayParameterType,
        componentLoadDelay,
        componentLoadRepeatInterval,
        onEventChangeDelay,
        componentLoadRepeatIntervalExpression,
        componentLoadDelayExpression,
        onEventChangeDelayExpression
    } = props;
    if (componentLoadDelayParameterType === "number") {
        delayValue = componentLoadDelay;
    } else {
        delayValue =
            componentLoadDelayExpression?.status === "available" && componentLoadDelayExpression.value !== undefined
                ? componentLoadDelayExpression.value.toNumber()
                : undefined;
    }
    if (componentLoadRepeatIntervalParameterType === "number") {
        intervalValue = componentLoadRepeatInterval;
    } else {
        intervalValue =
            componentLoadRepeatIntervalExpression?.status === "available" &&
            componentLoadRepeatIntervalExpression.value !== undefined
                ? componentLoadRepeatIntervalExpression.value.toNumber()
                : undefined;
    }
    if (onEventChangeDelayParameterType === "number") {
        delayValue = onEventChangeDelay;
    } else {
        delayValue =
            onEventChangeDelayExpression?.status === "available" && onEventChangeDelayExpression.value !== undefined
                ? onEventChangeDelayExpression.value.toNumber()
                : undefined;
    }
    return [delayValue, intervalValue];
}
