import { useMemo } from "react";
import { FormatParamsType, LocalizeContainerProps } from "typings/LocalizeProps";

type FormatParams = Record<string, string | Big | Date | undefined | boolean>;

export function useFormatParams({
    formatParams
}: LocalizeContainerProps): [loading: boolean, params: FormatParams | null] {
    return useMemo((): [loading: boolean, params: FormatParams | null] => {
        const params: FormatParams = {};
        const loading = isLoading(formatParams);
        if (loading) {
            return [true, params];
        } else {
            return [false, extractParams(formatParams)];
        }
    }, [formatParams]);
}

function isLoading(params: FormatParamsType[]): boolean {
    let loading = false;
    let value;
    if (params.length === 0) {
        return false;
    }
    for (const item of params) {
        value = item[item.expType];
        loading ||= value.status === "loading";
    }
    return loading;
}

function extractParams(params: FormatParamsType[]): FormatParams | null {
    if (params.length === 0) {
        return null;
    }

    const result: FormatParams = {};
    for (const item of params) {
        result[item.name] = item[item.expType].value;
    }

    return result;
}
