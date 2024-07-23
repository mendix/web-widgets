import { ListAttributeValue, ListExpressionValue, ListReferenceSetValue, ListReferenceValue, ListValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { FilterStore, KeyProvider } from "./provider-next";
import { Result, error, value } from "./result-meta";
import { attrgroupFilterStore } from "./stores/store-utils";

type Store = NonNullable<FilterStore>;

type Group = {
    type: "attrs" | "reference";
    key: string;
    ref?: ListReferenceValue | ListReferenceSetValue;
    refOptions?: ListValue;
    caption?: ListExpressionValue<string>;
};

type GroupAttr = {
    key: string;
    attr: ListAttributeValue<string | Big | boolean | Date>;
};

type Entries<T> = Array<[key: string, value: T]>;

export class GroupStoreProvider implements KeyProvider {
    readonly type = "key-value";
    private _registry: Map<string, Store>;

    constructor(entries: Entries<Store>) {
        this._registry = new Map(entries);
    }

    get = (key: string): Store => {
        const store = this._registry.get(key);
        if (!store) {
            throw new TypeError(`GroupStoreProvider: unable to get store for key '${key}'`);
        }
        return store;
    };

    get conditions(): FilterCondition[] {
        return [];
    }

    setup(): void {}

    dispose(): void {}
}

interface Params {
    groupList: Group[];
    groupAttrs: GroupAttr[];
}

export function groupStoreFactory({ groupList, groupAttrs }: Params): Result<GroupStoreProvider, TypeError> {
    const entries: Entries<Array<ListAttributeValue<string | Big | boolean | Date>>> = groupList.map(grp => [
        grp.key,
        groupAttrs.flatMap(cfg => (cfg.key === grp.key ? [cfg.attr] : []))
    ]);

    const storeEntries: Entries<Store> = [];
    for (const [key, attrGroup] of entries) {
        const typeList = attrGroup.map(a => typeMapper(a.type));
        const typeSet = new Set(typeList);
        if (typeSet.size > 1) {
            return error(new TypeError(`All attributes in the group ('${key}') should be of a common type.`));
        }
        const [attr] = attrGroup;
        const store = attrgroupFilterStore(attr.type, attrGroup);
        if (store === null) {
            return error(new TypeError(`Unable to create store for group ('${key}')`));
        }
        storeEntries.push([key, store]);
    }

    return value(new GroupStoreProvider(storeEntries));
}

function typeMapper(type: ListAttributeValue["type"]): "date" | "number" | "string" | "enum" | "unsupported" {
    switch (type) {
        case "DateTime":
            return "date";
        case "AutoNumber":
        case "Decimal":
        case "Integer":
        case "Long":
            return "number";

        case "HashString":
        case "String":
            return "string";

        case "Boolean":
        case "Enum":
            return "enum";
        default:
            return "unsupported";
    }
}
