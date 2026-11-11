export function calculatePercentage(
    currentValue: number,
    minValue: number,
    maxValue: number,
    allowValueAboveMax = false
): number {
    if (currentValue < minValue) {
        return 0;
    }
    if (currentValue > maxValue && (!allowValueAboveMax || maxValue <= minValue)) {
        return 100;
    }
    const range = maxValue - minValue;
    const percentage = ((currentValue - minValue) / range) * 100;
    // Drop floating-point noise before rounding: 100.5 / 100 * 100 is 100.49999999999999.
    return Math.abs(Math.round(Number(percentage.toPrecision(12))));
}
