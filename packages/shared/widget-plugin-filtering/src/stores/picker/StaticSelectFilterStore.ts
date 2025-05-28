import { ListAttributeValue } from "mendix";
import { FilterCondition, LiteralExpression } from "mendix/filters";
import { attribute, equals, literal, or } from "mendix/filters/builders";
import { action, computed, makeObservable, observable } from "mobx";
import { selectedFromCond } from "../../condition-utils";
import { disposeFx } from "../../mobx-utils";
import { OptionWithState } from "../../typings/OptionWithState";
import { BaseSelectStore } from "./BaseSelectStore";
import { SearchStore } from "./SearchStore";

interface CustomOption {
    caption: string;
    value: string;
}

export class StaticSelectFilterStore extends BaseSelectStore {
    readonly storeType = "select";
    _attributes: ListAttributeValue[] = [];
    _customOptions: CustomOption[] = [];
    search: SearchStore;

    constructor(attributes: ListAttributeValue[], initCond: FilterCondition | null) {
        super();
        this.search = new SearchStore();
        this._attributes = attributes;

        makeObservable(this, {
            _attributes: observable.struct,
            _customOptions: observable.struct,
            allOptions: computed,
            options: computed,
            selectedOptions: computed,
            universe: computed,
            condition: computed,
            setCustomOptions: action,
            setDefaultSelected: action,
            updateProps: action,
            fromViewState: action
        });

        if (initCond) {
            this.fromViewState(initCond);
        }
    }

    get allOptions(): OptionWithState[] {
        const selected = this.selected;

        if (this._customOptions.length > 0) {
            return this._customOptions.map(opt => ({ ...opt, selected: selected.has(opt.value) }));
        }

        const options = this._attributes.flatMap(attr =>
            Array.from(attr.universe ?? [], value => {
                const stringValue = `${value}`;
                return {
                    caption: attr.formatter.format(value),
                    value: stringValue,
                    selected: selected.has(stringValue)
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

    get selectedOptions(): OptionWithState[] {
        return [...this.selected].flatMap(value => {
            const option = this.allOptions.find(opt => opt.value === value);
            return option ? [option] : [];
        });
    }

    get universe(): Set<string> {
        return new Set(this._attributes.flatMap(attr => Array.from(attr.universe ?? [], value => `${value}`)));
    }

    get condition(): FilterCondition | undefined {
        const selected = this.selected;
        const conditions = this._attributes.flatMap(attr => {
            const cond = getFilterCondition(attr, selected);
            return cond ? [cond] : [];
        });
        return conditions.length > 1 ? or(...conditions) : conditions[0];
    }

    setup(): () => void {
        const [disposers, dispose] = disposeFx();
        disposers.push(this.search.setup());
        return dispose;
    }

    setCustomOptions(options: CustomOption[]): void {
        this._customOptions = options;
    }

    setDefaultSelected(defaultSelected?: Iterable<string>): void {
        if (!this.blockSetDefaults && defaultSelected) {
            this.defaultSelected = defaultSelected;
            this.setSelected(defaultSelected);
            this.blockSetDefaults = true;
        }
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

        if (selected.length < 1) {
            return;
        }

        this.setSelected(selected);
        this.blockSetDefaults = true;
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
