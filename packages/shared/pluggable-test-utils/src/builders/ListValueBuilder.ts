import type { ListValue, ObjectItem } from "mendix";
import { Status } from "../constants.js";

// eslint-disable-next-line no-unused-vars
type ListValueBuilder = {
    withItems(items: ObjectItem[]): ListValue;
    withAmountOfItems(amount: number): ListValue;
    isLoading(): ListValue;
    isUnavailable(): ListValue;
    simple(): ListValue;
};

export function ListValueBuilder(): ListValueBuilder {
    const listValue: ListValue = {
        status: Status.Available,
        offset: 0,
        limit: 1,
        items: [{ id: "1" } as ObjectItem, { id: "2" } as ObjectItem],
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
    return {
        withItems(items: ObjectItem[]): ListValue {
            return { ...listValue, items, totalCount: items.length };
        },

        withAmountOfItems(amount: number): ListValue {
            const items: ObjectItem[] = [];
            for (let i = 0; i < amount; i++) {
                items.push({ id: i.toString() } as ObjectItem);
            }
            return this.withItems(items);
        },
        isLoading(): ListValue {
            return { ...listValue, status: Status.Loading };
        },

        isUnavailable(): ListValue {
            return { ...listValue, status: Status.Unavailable };
        },

        simple(): ListValue {
            return listValue;
        }
    };
}
