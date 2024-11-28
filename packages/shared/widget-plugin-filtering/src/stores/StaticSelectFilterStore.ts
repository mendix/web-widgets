import { ListAttributeValue } from "mendix";
import { FilterCondition, LiteralExpression } from "mendix/filters";
import { attribute, equals, literal, or } from "mendix/filters/builders";
import { action, comparer, computed, makeObservable, observable, reaction, runInAction } from "mobx";
import { selectedFromCond } from "../condition-utils";
import { CustomOption, Option, OptionListFilterInterface } from "../typings/OptionListFilterInterface";
import { FilterData } from "../typings/settings";

export class StaticSelectFilterStore implements OptionListFilterInterface {
    readonly storeType = "optionlist";
    readonly type = "select";
    readonly isLoading = false;
    readonly hasMore = false;
    readonly hasSearch = false;
    defaultValue: string[] | undefined = undefined;
    isInitialized = false;

    _selected = new Set<string>();
    _attributes: ListAttributeValue[] = [];
    _customOptions: CustomOption[] = [];
    _search = "";
    _searchBuffer = "";

    constructor(attributes: ListAttributeValue[], initCond: FilterCondition | null) {
        this._attributes = attributes;

        makeObservable(this, {
            _attributes: observable.ref,
            _selected: observable,
            _customOptions: observable.ref,
            _search: observable,
            _searchBuffer: observable,

            allOptions: computed,
            options: computed,
            universe: computed,
            replace: action,
            toggle: action,
            updateProps: action,
            fromJSON: action,
            fromViewState: action,
            setCustomOptions: action,
            setSearch: action
        });

        if (initCond) {
            this.fromViewState(initCond);
        }
    }

    setup(): () => void {
        return reaction(
            () => this._searchBuffer.trim(),
            search =>
                runInAction(() => {
                    console.log(search);
                    this._search = search;
                }),
            { delay: 300 }
        );
    }

    get allOptions(): Option[] {
        if (this._customOptions.length > 0) {
            return this._customOptions.map(opt => ({ ...opt, selected: this._selected.has(opt.value) }));
        }

        const options = this._attributes.flatMap(attr =>
            Array.from(attr.universe ?? [], value => {
                const stringValue = `${value}`;
                return {
                    caption: attr.formatter.format(value),
                    value: stringValue,
                    selected: this._selected.has(stringValue)
                };
            })
        );

        return options;
    }

    get options(): Option[] {
        const options = this.allOptions;
        if (!this._search) {
            return options;
        }

        return options.filter(opt => opt.caption.toLowerCase().includes(this._search.toLowerCase()));
    }

    get universe(): Set<string> {
        return new Set(this._attributes.flatMap(attr => Array.from(attr.universe ?? [], value => `${value}`)));
    }

    get condition(): FilterCondition | undefined {
        const conditions = this._attributes.flatMap(attr => {
            const cond = getFilterCondition(attr, this._selected);
            return cond ? [cond] : [];
        });
        return conditions.length > 1 ? or(...conditions) : conditions[0];
    }

    get searchBuffer(): string {
        return this._searchBuffer;
    }

    UNSAFE_setDefaults = (value?: string[]): void => {
        this.defaultValue ??= value;
        if (this.isInitialized === false && this.defaultValue !== undefined) {
            this.replace(this.defaultValue);
            this.isInitialized = true;
        }
    };

    reset = (): void => {
        this.replace(this.defaultValue !== undefined ? this.defaultValue : []);
    };

    /** Just to have uniform clear method on all filter stores. */
    clear = (): void => {
        this.replace([]);
    };

    updateProps(attributes: ListAttributeValue[]): void {
        if (!comparer.shallow(this._attributes, attributes)) {
            this._attributes = attributes;
        }
    }

    replace(value: string[] | Set<string>): void {
        const _value = new Set(value);
        if (comparer.structural(this._selected, _value)) {
            return;
        }
        this._selected = _value;
    }

    toggle(value: string): void {
        if (this._selected.delete(value) === false) {
            this._selected.add(value);
        }
    }

    checkAttrs(): TypeError | null {
        const isValidAttr = (attr: ListAttributeValue): boolean => /Enum|Boolean/.test(attr.type);

        if (this._attributes.every(isValidAttr)) {
            return null;
        }

        return new TypeError("StaticSelectFilterStore: invalid attribute found. Check widget configuration.");
    }

    isValidValue(value: string): boolean {
        return this.universe.has(value);
    }

    loadMore(): void {
        console.warn("StaticSelectFilterStore: calling loadMore has no effect.");
    }

    setSearch(value: string | undefined | null): void {
        this._searchBuffer = value ?? "";
    }

    toJSON(): string[] {
        return [...this._selected];
    }

    fromJSON(data: FilterData): void {
        if (Array.isArray(data) && data.every(item => typeof item === "string")) {
            this.replace(data as string[]);
        }
        this.isInitialized = true;
    }

    fromViewState(cond: FilterCondition): void {
        const val = (exp: LiteralExpression): string | undefined =>
            exp.valueType === "string"
                ? exp.value
                : exp.valueType === "boolean"
                ? exp.value
                    ? "true"
                    : "false"
                : undefined;

        const selected = selectedFromCond(cond, val);

        if (selected.length > 0) {
            this.replace(selected);
            this.isInitialized = true;
        }
    }

    setCustomOptions(options: CustomOption[]): void {
        this._customOptions = options;
    }
}

function getFilterCondition(
    listAttribute: ListAttributeValue | undefined,
    selected: Set<string>
): FilterCondition | undefined {
    if (!listAttribute || !listAttribute.filterable || selected.size === 0) {
        return undefined;
    }

    const { id, type } = listAttribute;
    const filterAttribute = attribute(id);

    const filters = [...selected]
        .filter(value => listAttribute.universe?.includes(universeValue(listAttribute.type, value)))
        .map(value => equals(filterAttribute, literal(universeValue(type, value))));

    if (filters.length > 1) {
        return or(...filters);
    }

    const [filterValue] = filters;
    return filterValue;
}

function universeValue(type: ListAttributeValue["type"], value: string): boolean | string {
    if (type === "Boolean") {
        if (value !== "true" && value !== "false") {
            return value;
        }
        return value === "true";
    }
    return value;
}
