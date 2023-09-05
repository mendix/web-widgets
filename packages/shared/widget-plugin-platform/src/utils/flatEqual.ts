type EqualFn = (a: any, b: any, key: string) => boolean;

const defaultEqual = Object.is;

function isObject(v: any): boolean {
    return typeof v === "object" && v !== null;
}

function flatEqual(a: object, b: object, equal: EqualFn = defaultEqual): boolean {
    if (isObject(a) && isObject(b)) {
        const keys = new Set(Object.keys(a).concat(Object.keys(b)));
        for (const k of keys) {
            if (!equal((a as any)[k], (b as any)[k], k)) {
                return false;
            }
        }
        return true;
    }
    return defaultEqual(a, b);
}

export { flatEqual, defaultEqual };
