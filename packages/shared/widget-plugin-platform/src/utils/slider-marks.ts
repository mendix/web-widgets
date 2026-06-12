import { ValueFormatter } from "./number-formatter";

export interface CreateMarksParams {
    numberOfMarks: number;
    decimalPlaces: number;
    format: ValueFormatter;
    min: number;
    max: number;
}

export function isParamsValidToCalcMarks(params: CreateMarksParams): boolean {
    return params.numberOfMarks > 0 && params.min < params.max;
}

export function createMarks(params: CreateMarksParams): Record<number, string> | undefined {
    if (!isParamsValidToCalcMarks(params)) {
        return;
    }

    const marks: Record<number, string> = {};
    const { numberOfMarks, decimalPlaces, format, min, max } = params;
    const interval = (max - min) / numberOfMarks;

    for (let i = 0; i <= numberOfMarks; i++) {
        const rawValue = min + i * interval;
        // Round the key to configured precision so rc-slider positions dot where label reads.
        // toFixed always uses "." so parseFloat is locale-safe.
        const key = parseFloat(rawValue.toFixed(decimalPlaces));
        marks[key] = format(rawValue);
    }

    return marks;
}
