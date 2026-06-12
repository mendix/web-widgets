import { Big } from "big.js";
import { NumberFormatter } from "mendix";

export type ValueFormatter = (value: number) => string;

export function createValueFormatter(formatter: NumberFormatter, decimalPlaces: number): ValueFormatter {
    const configured = formatter.withConfig({
        groupDigits: formatter.config.groupDigits,
        decimalPrecision: decimalPlaces
    });
    return (value: number) => configured.format(new Big(value));
}
