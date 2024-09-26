import { DynamicValue, ListReferenceValue, ObjectItem } from "mendix";
import { dynamic } from "../primitives/dynamic.js";
import { nanoid } from "../primitives/nanoid.js";
import { obj } from "../primitives/obj.js";
import { Writable } from "./type-utils.js";
export class ListReferenceValueBuilder {
    mock: Writable<ListReferenceValue>;
    constructor() {
        this.mock = {
            type: "Reference",
            id: `listRef_${nanoid()}` as any,
            filterable: true,
            get: jest.fn((_: ObjectItem) => dynamic(obj()))
        };
    }

    withGet(getter: (item: ObjectItem) => DynamicValue<ObjectItem>): this {
        this.mock.get = getter;
        return this;
    }

    withId(id: string): this {
        this.mock.id = id as any;
        return this;
    }

    build(): ListReferenceValue {
        return { ...this.mock };
    }
}
