import { ListAttributeValue } from "mendix";
import { FilterCondition, LiteralExpression } from "mendix/filters";
import { attribute, equals, literal, or } from "mendix/filters/builders";
import { action, computed, makeObservable, observable } from "mobx";
import { selectedFromCond } from "../condition-utils";
import { BaseSelectStore } from "../typings/BaseSelectStore";
import { CustomOption, OptionWithState } from "../typings/OptionListFilterInterface";
import { FilterData } from "../typings/settings";
import { SearchStore } from "./SearchStore";

export class StaticSelectFilterStore implements BaseSelectStore {
    readonly disposers = [] as Array<() => void>;
    readonly storeType = "optionlist";
    readonly type = "select";
    defaultValue: string[] | undefined = undefined;
    isInitialized = false;
    selected = new Set<string>();
    _attributes: ListAttributeValue[] = [];
    _customOptions: CustomOption[] = [];
    search: SearchStore;

    constructor(attributes: ListAttributeValue[], initCond: FilterCondition | null) {
        this._attributes = attributes;
        this.search = new SearchStore();

        makeObservable(this, {
            selected: observable.struct,
            _attributes: observable.struct,
            _customOptions: observable.struct,

            allOptions: computed,
            universe: computed,
            options: computed,

            setSelected: action,
            toggle: action,
            reset: action,
            clear: action,
            updateProps: action,
            fromJSON: action,
            fromViewState: action,
            setCustomOptions: action
        });

        if (initCond) {
            this.fromViewState(initCond);
        }
    }

    setup(): () => void {
        this.disposers.push(this.search.setup());
        return () => {
            this.disposers.forEach(dispose => dispose());
            this.disposers.length = 0;
        };
    }

    get allOptions(): OptionWithState[] {
        if (this._customOptions.length > 0) {
            return this._customOptions.map(opt => ({ ...opt, selected: this.selected.has(opt.value) }));
        }

        const options = this._attributes.flatMap(attr =>
            Array.from(attr.universe ?? [], value => {
                const stringValue = `${value}`;
                return {
                    caption: attr.formatter.format(value),
                    value: stringValue,
                    selected: this.selected.has(stringValue)
                };
            })
        );

        return options;
    }

    get options(): OptionWithState[] {
        if (!this.search.value) {
            return this.allOptions;
        }

        return this.allOptions.filter(opt => opt.caption.toLowerCase().includes(this.search.value.toLowerCase()));
    }

    get universe(): Set<string> {
        return new Set(this._attributes.flatMap(attr => Array.from(attr.universe ?? [], value => `${value}`)));
    }

    get condition(): FilterCondition | undefined {
        const conditions = this._attributes.flatMap(attr => {
            const cond = getFilterCondition(attr, this.selected);
            return cond ? [cond] : [];
        });
        return conditions.length > 1 ? or(...conditions) : conditions[0];
    }

    setSelected = (value: Iterable<string>): void => {
        this.selected = new Set(value);
    };

    reset = (): void => {
        this.setSelected(this.defaultValue ?? []);
    };

    /** Just to have uniform clear method on all filter stores. */
    clear = (): void => {
        this.setSelected([]);
    };

    toggle(value: string): void {
        const selected = new Set(this.selected);
        if (selected.delete(value) === false) {
            selected.add(value);
        }
        this.selected = selected;
    }

    UNSAFE_setDefaults = (value?: string[]): void => {
        if (this.isInitialized || !value) {
            return;
        }
        this.defaultValue ??= value;
        this.isInitialized = true;
        this.reset();
    };

    setCustomOptions(options: CustomOption[]): void {
        this._customOptions = options;
    }

    updateProps(attributes: ListAttributeValue[]): void {
        this._attributes = attributes;
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

    toJSON(): string[] {
        return [...this.selected];
    }

    fromJSON(data: FilterData): void {
        if (Array.isArray(data) && data.every(item => typeof item === "string")) {
            this.setSelected(data as string[]);
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
            this.setSelected(selected);
            this.isInitialized = true;
        }
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
