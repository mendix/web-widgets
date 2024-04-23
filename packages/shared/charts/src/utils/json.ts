export function fallback(value: string | undefined): string {
    return value === "" || value === undefined ? "{}" : value;
}
