export function calculatePercentage(
    currentValue: number,
    minValue: number,
    maxValue: number,
    allowValueAboveMax = false
): number {
    if (currentValue < minValue) {
        return 0;
    }
    if (currentValue > maxValue && (!allowValueAboveMax || maxValue === minValue)) {
        return 100;
    }
    const range = maxValue - minValue;
    const percentage = Math.round(((currentValue - minValue) / range) * 100);
    return Math.abs(percentage);
}
