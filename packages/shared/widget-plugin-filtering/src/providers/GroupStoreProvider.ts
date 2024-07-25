import { ListAttributeValue, ListExpressionValue, ListReferenceSetValue, ListReferenceValue, ListValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { KeyProvider } from "../context";
import { Result, error, value } from "../result-meta";
import { attrgroupFilterStore, InputFilterStore } from "../stores/store-utils";
import { APIError, APIErrorCode } from "../errors";
import { StaticSelectFilterStore } from "../stores/StaticSelectFilterStore";
import { computed, makeObservable, trace } from "mobx";
import { FiltersSettingsMap } from "../typings/settings";

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

type Store = InputFilterStore | StaticSelectFilterStore;

export class GroupStoreProvider implements KeyProvider {
    readonly type = "key-value";
    private _registry: Map<string, Store>;

    constructor(entries: Entries<Store>) {
        this._registry = new Map(entries);
        makeObservable(this, {
            conditions: computed,
            settings: computed
        });

        console.debug(trace(this, "conditions"));
    }

    get conditions(): Array<FilterCondition | undefined> {
        return [...this._registry.values()].map(store => store.condition);
    }

    get settings(): FiltersSettingsMap<string> {
        const entries = Array.from(this._registry.entries(), ([key, store]) => [key, store.toJSON()] as const);
        return new Map(entries);
    }

    set settings(value: FiltersSettingsMap<string> | undefined) {
        if (value === undefined) {
            this._registry.forEach(store => store.reset());
        } else {
            for (const [key, data] of value) {
                this._registry.get(key)?.fromJSON(data);
            }
        }
    }

    get = (key: string): Store | null => {
        return this._registry.get(key) ?? null;
    };

    setup(): void {}

    dispose(): void {}
}

interface Params {
    groupList: Group[];
    groupAttrs: GroupAttr[];
}

export function groupStoreFactory({ groupList, groupAttrs }: Params): Result<GroupStoreProvider, APIError> {
    const entries: Entries<Array<ListAttributeValue<string | Big | boolean | Date>>> = groupList.map(grp => [
        grp.key,
        groupAttrs.flatMap(cfg => (cfg.key === grp.key ? [cfg.attr] : []))
    ]);

    const storeEntries: Entries<Store> = [];
    for (const [key, attrGroup] of entries) {
        const typeList = attrGroup.map(a => typeMapper(a.type));
        const typeSet = new Set(typeList);
        if (typeSet.size > 1) {
            return error({
                code: APIErrorCode.EGRPINVALIDATTRS,
                message: `All attributes in the group ('${key}') should be of a common type.`
            });
        }
        const [attr] = attrGroup;
        const store = attrgroupFilterStore(attr.type, attrGroup);
        if (store === null) {
            return error({
                code: APIErrorCode.EGRPSTORECREATE,
                message: `Unable to create store for group ('${key}')`
            });
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
