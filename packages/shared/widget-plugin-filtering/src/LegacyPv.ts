import { action, comparer, computed, makeObservable, observable, reaction } from "mobx";
import { ListAttributeValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { FilterType as Ft } from "./provider";
import { LegacyProvider } from "./provider-next";
import { DateInputFilterStore } from "./stores/DateInputFilterStore";
import { NumberInputFilterStore } from "./stores/NumberInputFilterStore";
import { StaticSelectFilterStore } from "./stores/StaticSelectFilterStore";
import { StringInputFilterStore } from "./stores/StringInputFilterStore";
import { InputFilterInterface } from "./typings/InputFilterInterface";
import { OptionListFilterInterface } from "./typings/OptionListFilterInterface";

type FilterMap = {
    [Ft.STRING]: StringInputFilterStore | null;
    [Ft.NUMBER]: NumberInputFilterStore | null;
    [Ft.DATE]: DateInputFilterStore | null;
    [Ft.ENUMERATION]: StaticSelectFilterStore | null;
};

type FilterList = [
    StringInputFilterStore | null,
    NumberInputFilterStore | null,
    DateInputFilterStore | null,
    StaticSelectFilterStore | null
];

export class LegacyPv implements LegacyProvider {
    readonly type = "legacy";
    private _attrs: ListAttributeValue[];
    dispose?: () => void;
    filterMap: FilterMap;
    filterList: FilterList;

    constructor(attrs: ListAttributeValue[]) {
        this._attrs = attrs;
        const map = (this.filterMap = createMap(attrs));
        this.filterList = [map[Ft.STRING], map[Ft.NUMBER], map[Ft.DATE], map[Ft.ENUMERATION]];
        makeObservable<this, "_attrs">(this, {
            _attrs: observable.ref,
            conditions: computed,
            updateProps: action
        });
    }

    get conditions(): Array<FilterCondition | undefined> {
        return this.filterList.map(store => (store ? store.filterCondition : undefined));
    }

    get = (type: Ft): InputFilterInterface | OptionListFilterInterface<string> | null => {
        return this.filterMap[type];
    };

    updateProps(attrs: ListAttributeValue[]): void {
        this._attrs = attrs;
    }

    updateFilters(attrs: ListAttributeValue[]): void {
        const [str, num, dte, enm] = groupByType(attrs);
        const [s1, s2, s3, s4] = this.filterList;
        s1?.updateProps(str);
        s2?.updateProps(num);
        s3?.updateProps(dte);
        s4?.updateProps(enm);
    }

    setup(): () => void {
        const disposers = this.filterList.map(s => () => s && "dispose" in s && s.dispose());
        disposers.push(
            reaction(
                () => this._attrs,
                attrs => this.updateFilters(attrs),
                { equals: comparer.shallow }
            )
        );

        return (this.dispose = () => disposers.forEach(dispose => dispose()));
    }
}

function createMap(attrs: ListAttributeValue[]): FilterMap {
    const createStore = <T, S>(cls: new (attrs: T[]) => S, attrs: T[]): S | null =>
        attrs.length > 0 ? new cls(attrs) : null;

    const [str, num, dte, enm] = groupByType(attrs);

    const r: FilterMap = {
        [Ft.STRING]: createStore(StringInputFilterStore, str),
        [Ft.NUMBER]: createStore(NumberInputFilterStore, num),
        [Ft.DATE]: createStore(DateInputFilterStore, dte),
        [Ft.ENUMERATION]: createStore(StaticSelectFilterStore, enm)
    };

    return r;
}

function groupByType(
    attrs: ListAttributeValue[]
): [
    Array<ListAttributeValue<string>>,
    Array<ListAttributeValue<Big>>,
    Array<ListAttributeValue<Date>>,
    Array<ListAttributeValue<string | boolean>>
] {
    return [
        attrs.filter(isStringAttr),
        attrs.filter(isNumberAttr),
        attrs.filter(isDateAttr),
        attrs.filter((a): a is ListAttributeValue<string | boolean> => isBoolAttr(a) || isEnumAttr(a))
    ];
}

function isDateAttr(attr: ListAttributeValue): attr is ListAttributeValue<Date> {
    return attr.type === "DateTime";
}

function isBoolAttr(attr: ListAttributeValue): attr is ListAttributeValue<boolean> {
    return attr.type === "Boolean";
}

function isEnumAttr(attr: ListAttributeValue): attr is ListAttributeValue<string> {
    return attr.type === "Enum";
}

function isNumberAttr(attr: ListAttributeValue): attr is ListAttributeValue<Big> {
    return attr.type === "Long" || attr.type === "Decimal" || attr.type === "Integer" || attr.type === "AutoNumber";
}
function isStringAttr(attr: ListAttributeValue): attr is ListAttributeValue<string> {
    return attr.type === "HashString" || attr.type === "String";
}
