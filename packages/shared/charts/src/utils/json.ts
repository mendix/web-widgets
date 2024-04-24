export function fallback(value: string | undefined): string {
    return value === "" || value === undefined ? "{}" : value;
}

export function pprint(value: string): string {
    try {
        value = JSON.stringify(JSON.parse(value), null, 2);
    } catch {
        console.warn("Failed to prettify json value.");
    }
    return value;
}
