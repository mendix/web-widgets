import { ListAttributeValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { action, comparer, computed, makeObservable, observable, reaction } from "mobx";
import { FilterType as Ft, LegacyProvider } from "../context";
import { DateInputFilterStore } from "../stores/input/DateInputFilterStore";
import { NumberInputFilterStore } from "../stores/input/NumberInputFilterStore";
import { StringInputFilterStore } from "../stores/input/StringInputFilterStore";
import { StaticSelectFilterStore } from "../stores/picker/StaticSelectFilterStore";
import { InputFilterInterface } from "../typings/InputFilterInterface";
import { PickerFilterStore } from "../typings/PickerFilterStore";
import { FiltersSettingsMap } from "../typings/settings";

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

    constructor(attrs: ListAttributeValue[], dsViewState: Array<FilterCondition | undefined> | null) {
        this._attrs = attrs;
        const map = (this.filterMap = createMap(attrs, dsViewState));
        this.filterList = [map[Ft.STRING], map[Ft.NUMBER], map[Ft.DATE], map[Ft.ENUMERATION]];
        makeObservable<this, "_attrs">(this, {
            _attrs: observable.ref,
            conditions: computed,
            settings: computed,
            updateProps: action
        });
    }

    get conditions(): Array<FilterCondition | undefined> {
        return this.filterList.map(store => (store ? store.condition : undefined));
    }

    get settings(): FiltersSettingsMap<string> {
        return new Map();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    set settings(_: unknown) {}

    get = (type: Ft): InputFilterInterface | PickerFilterStore | null => {
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
        const disposers: Array<() => void> = [];
        this.filterList.forEach(store => {
            if (store && "setup" in store) {
                disposers.push(store.setup());
            }
        });
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

function createMap(attrs: ListAttributeValue[], dsViewState: Array<FilterCondition | undefined> | null): FilterMap {
    const [ini1 = null, ini2 = null, ini3 = null, ini4 = null] = dsViewState ?? [];
    const [str, num, dte, enm] = groupByType(attrs);

    const r: FilterMap = {
        [Ft.STRING]: str.length > 0 ? new StringInputFilterStore(str, ini1) : null,
        [Ft.NUMBER]: num.length > 0 ? new NumberInputFilterStore(num, ini2) : null,
        [Ft.DATE]: dte.length > 0 ? new DateInputFilterStore(dte, ini3) : null,
        [Ft.ENUMERATION]: enm.length > 0 ? new StaticSelectFilterStore(enm, ini4) : null
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
