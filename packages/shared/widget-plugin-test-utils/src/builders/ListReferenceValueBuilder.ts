import { ListReferenceValue } from "mendix";
import { dynamicValue } from "../primitives/dynamic.js";

export class ListReferenceValueBuilder {
    mock: ListReferenceValue;
    constructor() {
        this.mock = {
            type: "Reference",
            id: `listRef_${Math.random().toFixed(16).slice(2, 6)}` as any,
            filterable: true,
            get: () => dynamicValue as any
        };
    }
    withId(id: string): this {
        this.mock.id = id as any;
        return this;
    }
}
