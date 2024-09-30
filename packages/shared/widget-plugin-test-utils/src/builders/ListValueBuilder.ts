import type { ListValue, ObjectItem } from "mendix";
import { Status } from "../constants.js";
import { Writable } from "./type-utils.js";
import { obj } from "../primitives/obj.js";
import { objArray } from "../primitives/objArray.js";

export class ListValueBuilder {
    mock: Writable<ListValue>;
    constructor() {
        this.mock = {
            status: Status.Available,
            offset: 0,
            limit: 2,
            items: [obj(), obj()],
            totalCount: 2,
            hasMoreItems: false,
            setLimit: jest.fn(),
            setOffset: jest.fn(),
            requestTotalCount: jest.fn(),
            sortOrder: [],
            filter: undefined,
            setSortOrder: jest.fn(),
            setFilter: jest.fn(),
            reload: jest.fn()
        };
    }

    withItems(items: ObjectItem[]): this {
        this.mock.items = items;
        this.mock.totalCount = items.length;
        this.mock.limit = items.length;
        return this;
    }

    withSize(size: number): this {
        this.withItems(objArray(size));
        return this;
    }

    withHasMore(value: boolean): this {
        this.mock.hasMoreItems = value;
        return this;
    }

    isLoading(): this {
        this.mock.status = Status.Loading;
        this.mock.items = undefined;
        return this;
    }

    isUnavailable(): this {
        this.mock.status = Status.Loading;
        this.mock.items = undefined;
        return this;
    }

    build(): ListValue {
        return { ...this.mock };
    }
}
