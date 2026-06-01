import { MarkObj } from "@rc-component/slider/lib/Marks";
import { ReactNode } from "react";
import { ValueFormatter } from "./helpers";

export type Marks = Record<string | number, ReactNode | MarkObj>;

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

export function createMarks(params: CreateMarksParams): Marks | undefined {
    if (!isParamsValidToCalcMarks(params)) {
        return;
    }

    const marks: Marks = {};
    const { numberOfMarks, decimalPlaces, format, min, max } = params;
    const interval = (max - min) / numberOfMarks;

    for (let i = 0; i <= numberOfMarks; i++) {
        const rawValue = min + i * interval;
        // Round the key to the configured precision so rc-slider positions the dot where its
        // label reads. toFixed always uses "." here, so parseFloat is locale-safe.
        const key = parseFloat(rawValue.toFixed(decimalPlaces));
        marks[key] = format(rawValue);
    }

    return marks;
}
