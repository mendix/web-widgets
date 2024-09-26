import { DynamicValue, ListReferenceSetValue, ObjectItem } from "mendix";
import { dynamic } from "../primitives/dynamic.js";
import { nanoid } from "../primitives/nanoid.js";
import { objArray } from "../primitives/objArray.js";
import { Writable } from "./type-utils.js";

export class ListReferenceSetValueBuilder {
    mock: Writable<ListReferenceSetValue>;
    constructor() {
        this.mock = {
            type: "ReferenceSet",
            id: `listRefSet_${nanoid()}` as any,
            filterable: true,
            get: jest.fn((_: ObjectItem) => dynamic(objArray(1)))
        };
    }

    withGet(getter: (item: ObjectItem) => DynamicValue<ObjectItem[]>): this {
        this.mock.get = getter;
        return this;
    }

    withId(id: string): this {
        this.mock.id = id as any;
        return this;
    }

    build(): ListReferenceSetValue {
        return { ...this.mock };
    }
}
