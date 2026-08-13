export function prettifyJson(json: string): string {
    try {
        return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
        return '{ "error": "invalid JSON" }';
    }
}

export function isEquivalentJson(a: string, b: string): boolean {
    try {
        return JSON.stringify(JSON.parse(a)) === JSON.stringify(JSON.parse(b));
    } catch {
        return a === b;
    }
}
