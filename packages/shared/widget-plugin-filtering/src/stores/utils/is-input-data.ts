import { InputData } from "../../typings/settings";

const fnNames = new Set([
    "empty",
    "notEmpty",
    "equal",
    "notEqual",
    "greater",
    "greaterEqual",
    "smaller",
    "smallerEqual",
    "between",
    "contains",
    "startsWith",
    "endsWith"
]);

export function isInputData(data: unknown): data is InputData {
    if (Array.isArray(data)) {
        const [name] = data;
        return fnNames.has(name);
    }
    return false;
}
