import { MarkObj } from "@rc-component/slider/lib/Marks";
import { ReactNode } from "react";
import { formatNumber } from "./helpers";

export type Marks = Record<string | number, ReactNode | MarkObj>;

export interface CreateMarksParams {
    numberOfMarks: number;
    decimalPlaces: number;
    decimalSeparator: string;
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
    const { numberOfMarks, decimalPlaces, decimalSeparator, min, max } = params;
    const interval = (max - min) / numberOfMarks;

    for (let i = 0; i <= numberOfMarks; i++) {
        const rawValue = min + i * interval;
        const key = parseFloat(rawValue.toFixed(decimalPlaces));
        marks[key] = formatNumber(rawValue, decimalPlaces, decimalSeparator);
    }

    return marks;
}
