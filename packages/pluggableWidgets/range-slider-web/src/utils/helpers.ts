import { Big } from "big.js";
import { NumberFormatter } from "mendix";

export type ValueFormatter = (value: number) => string;

/**
 * Builds a value formatter from the attribute's own Mendix NumberFormatter, overriding only the
 * decimal precision. Reusing the runtime formatter means the decimal separator and thousands
 * grouping follow the user's session locale and the attribute's `groupDigits` setting automatically.
 */
export function createValueFormatter(formatter: NumberFormatter, decimalPlaces: number): ValueFormatter {
    const configured = formatter.withConfig({
        groupDigits: formatter.config.groupDigits,
        decimalPrecision: decimalPlaces
    });
    return (value: number) => configured.format(new Big(value));
}
