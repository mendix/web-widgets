import { Big } from "big.js";
import { NumberFormatter } from "mendix";

export const getSliderLabel = (sliderId: string): Element | null => document.querySelector(`label[for="${sliderId}"]`);

export function getDecimalSeparator(formatter: NumberFormatter): string {
    const formatted = formatter.format(new Big("1.1"));
    return formatted.charAt(1);
}

export function formatNumber(value: number, decimalPlaces: number, decimalSeparator: string): string {
    if (decimalPlaces === 0) {
        return String(Math.round(value));
    }
    const formatted = value.toFixed(decimalPlaces);
    return decimalSeparator !== "." ? formatted.replace(".", decimalSeparator) : formatted;
}
