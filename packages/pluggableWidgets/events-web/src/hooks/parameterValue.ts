import { useMemo } from "react";

interface parameterValueProps {
    parameterType: "number" | "expression";
    parameterValue: number | undefined;
    parameterExpression: { status: string; value: { toNumber: () => number } | undefined } | undefined;
}

export function useParameterValue({
    parameterType,
    parameterValue,
    parameterExpression
}: parameterValueProps): number | undefined {
    return useMemo(() => {
        if (parameterType === "number") {
            return parameterValue;
        }

        return parameterExpression?.status === "available" && parameterExpression.value !== undefined
            ? parameterExpression.value.toNumber()
            : undefined;
    }, [parameterType, parameterValue, parameterExpression]);
}
