interface ParameterTypeProps {
    componentLoadDelayParameterType: string;
    componentLoadRepeatParameterType: string;
    onEventChangeDelayParameterType: string;
    componentLoadDelayInteger?: number;
    componentLoadRepeatInterval?: number;
    onEventChangeDelayInteger?: number;
    componentLoadRepeatExpression?: { status: string; value: { toNumber: () => number } | undefined };
    componentLoadDelayExpression?: { status: string; value: { toNumber: () => number } | undefined };
    onEventChangeDelayExpression?: { status: string; value: { toNumber: () => number } | undefined };
}

export function useDelayAndInterval(props: ParameterTypeProps): [number | undefined, number | undefined] {
    let delayValue: number | undefined;
    let intervalValue: number | undefined;
    const {
        componentLoadDelayParameterType,
        componentLoadRepeatParameterType,
        onEventChangeDelayParameterType,
        componentLoadDelayInteger,
        componentLoadRepeatInterval,
        onEventChangeDelayInteger,
        componentLoadRepeatExpression,
        componentLoadDelayExpression,
        onEventChangeDelayExpression
    } = props;
    if (componentLoadDelayParameterType === "number") {
        delayValue = componentLoadDelayInteger;
    } else {
        delayValue =
            componentLoadDelayExpression?.status === "available" && componentLoadDelayExpression.value !== undefined
                ? componentLoadDelayExpression.value.toNumber()
                : undefined;
    }
    if (componentLoadRepeatParameterType === "number") {
        intervalValue = componentLoadRepeatInterval;
    } else {
        intervalValue =
            componentLoadRepeatExpression?.status === "available" && componentLoadRepeatExpression.value !== undefined
                ? componentLoadRepeatExpression.value.toNumber()
                : undefined;
    }
    if (onEventChangeDelayParameterType === "number") {
        delayValue = onEventChangeDelayInteger;
    } else {
        delayValue =
            onEventChangeDelayExpression?.status === "available" && onEventChangeDelayExpression.value !== undefined
                ? onEventChangeDelayExpression.value.toNumber()
                : undefined;
    }
    return [delayValue, intervalValue];
}
