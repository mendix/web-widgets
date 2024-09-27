import { ObjectItem } from "mendix";

export function cases<T>(...cases: Array<[ObjectItem | undefined, T]>): (item: ObjectItem) => T {
    const hasDefaultCase = cases.some(([obj]) => obj === undefined);
    if (!hasDefaultCase) {
        throw new Error("You must specify default case: [undefined, <your default value>]");
    }
    const map = new Map(cases);
    return item => {
        return map.get(item) ?? map.get(undefined)!;
    };
}
