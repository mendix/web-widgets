import { ListAttributeValue, ListExpressionValue, ListReferenceSetValue, ListReferenceValue, ListValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { KeyProvider } from "../context";
import { Result, error, value } from "../result-meta";
import { attrgroupFilterStore, InputFilterStore } from "../stores/store-utils";
import { APIError, APIErrorCode } from "../errors";
import { StaticSelectFilterStore } from "../stores/StaticSelectFilterStore";
import { computed, makeObservable, trace } from "mobx";
import { FiltersSettingsMap } from "../typings/settings";
import { RefFilterStore } from "../stores/RefFilterStore";

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

type Store = InputFilterStore | StaticSelectFilterStore | RefFilterStore;

interface Props {
    groupList: Group[];
    groupAttrs: GroupAttr[];
}

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

    /** It turns out only ref group need updates. */
    updateProps(props: Props): void {
        props.groupList.forEach(grp => {
            if (grp.type === "reference" && hasAllData(grp)) {
                const store = this._registry.get(grp.key);
                if (store?.type === "refselect") {
                    store.updateProps(grp);
                }
            }
        });
    }
}

export function groupStoreFactory({ groupList, groupAttrs }: Props): Result<GroupStoreProvider, APIError> {
    const entries: Array<[grp: Group, attrs: ListAttributeValue[]]> = groupList.map(grp => [
        grp,
        groupAttrs.flatMap(cfg => (cfg.key === grp.key ? [cfg.attr] : []))
    ]);

    const storeEntries: Entries<Store> = [];
    for (const [grp, attrs] of entries) {
        const store = grp.type === "attrs" ? attrStore(grp, attrs) : refStore(grp);
        if (store.hasError) {
            return error(store.error);
        }
        storeEntries.push([grp.key, store.value]);
    }

    return value(new GroupStoreProvider(storeEntries));
}

function attrStore(
    group: Group,
    attrs: ListAttributeValue[]
): Result<InputFilterStore | StaticSelectFilterStore, APIError> {
    if (attrs.length === 0) {
        return error({
            code: APIErrorCode.EGRPINVALIDATTRS,
            message: `At least one attribute for the group ('${group.key}') is required.`
        });
    }
    // Check type consistency among attributes.
    const typeSet = new Set(attrs.map(a => typeMapper(a.type)));
    if (typeSet.size > 1) {
        return error({
            code: APIErrorCode.EGRPINVALIDATTRS,
            message: `All attributes in the group ('${group.key}') should be of a common type.`
        });
    }

    const [attr] = attrs;
    const store = attrgroupFilterStore(attr.type, attrs);
    if (store === null) {
        return error({
            code: APIErrorCode.EGRPSTORECREATE,
            message: `Unable to create store for group ('${group.key}')`
        });
    }

    return value(store);
}

function refStore(group: Group): Result<RefFilterStore, APIError> {
    if (!group.ref) {
        return error({
            code: APIErrorCode.EGRPSTORECREATE,
            message: `The group ('${group.key}') reference source is required.`
        });
    }
    if (!group.refOptions) {
        return error({
            code: APIErrorCode.EGRPSTORECREATE,
            message: `The group ('${group.key}') options source is required.`
        });
    }
    if (!group.caption) {
        return error({
            code: APIErrorCode.EGRPSTORECREATE,
            message: `The group ('${group.key}') option caption template is required.`
        });
    }
    return value(new RefFilterStore({ ref: group.ref, refOptions: group.refOptions, caption: group.caption }));
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

type NonOptional<T> = {
    [P in keyof T]-?: T[P];
};

function hasAllData<T extends object>(obj: T): obj is NonOptional<T> {
    return Object.keys(obj).every(key => obj[key as keyof T] !== undefined);
}
