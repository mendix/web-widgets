import { ListAttributeValue } from "mendix";
import { FilterType } from "./provider";
import { LegacyProvider } from "./provider-next";
import { InputFilterInterface } from "./typings/InputFilterInterface";
import { OptionListFilterInterface } from "./typings/OptionListFilterInterface";
import { StringInputFilterStore } from "./stores/StringInputFilterStore";
import { NumberInputFilterStore } from "./stores/NumberInputFilterStore";
import { DateInputFilterStore } from "./stores/DateInputFilterStore";
import { StaticSelectFilterStore } from "./stores/StaticSelectFilterStore";

type Store = InputFilterInterface | OptionListFilterInterface<string>;

export class LegacyPv implements LegacyProvider {
    readonly type = "legacy";
    stores: Record<FilterType, Store | null>;

    constructor(attrs: Array<ListAttributeValue<string | Big | Date | boolean>>) {
        this.stores = createMap(attrs);
    }

    get = (type: FilterType): Store | null => {
        return this.stores[type];
    };

    dispose(): void {
        for (const store of Object.values(this.stores)) {
            if (store) {
                store.dispose?.();
            }
        }
    }
}

function createMap(attrs: Array<ListAttributeValue<string | Big | Date | boolean>>): Record<FilterType, Store | null> {
    const r: Record<FilterType, Store | null> = {
        [FilterType.STRING]: new StringInputFilterStore(attrs.filter(isStringAttr)),
        [FilterType.NUMBER]: new NumberInputFilterStore(attrs.filter(isNumberAttr)),
        [FilterType.DATE]: new DateInputFilterStore(attrs.filter(isDateAttr)),
        [FilterType.ENUMERATION]: new StaticSelectFilterStore(attrs.filter(a => isBoolAttr(a) || isEnumAttr(a))),
        [FilterType.ASSOCIATION]: null
    };

    return r;
}

function isDateAttr(attr: ListAttributeValue<string | Big | Date | boolean>): attr is ListAttributeValue<Date> {
    return attr.type === "DateTime";
}

function isBoolAttr(attr: ListAttributeValue<string | Big | Date | boolean>): attr is ListAttributeValue<boolean> {
    return attr.type === "Boolean";
}

function isEnumAttr(attr: ListAttributeValue<string | Big | Date | boolean>): attr is ListAttributeValue<string> {
    return attr.type === "Enum";
}

function isNumberAttr(attr: ListAttributeValue<string | Big | Date | boolean>): attr is ListAttributeValue<Big> {
    return attr.type === "Long" || attr.type === "Decimal" || attr.type === "Integer" || attr.type === "AutoNumber";
}
function isStringAttr(attr: ListAttributeValue<string | Big | Date | boolean>): attr is ListAttributeValue<string> {
    return attr.type === "HashString" || attr.type === "String";
}
