import { ListAttributeValue } from "mendix";
import { makeObservable, computed, observable, action } from "mobx";
import { SelectOnlyFilter, Option } from "./typings/ComboboxFilterInterface";
import { FilterCondition } from "mendix/filters";
import { equals, literal, attribute, or } from "mendix/filters/builders";

export class StaticSelectFilterStore implements SelectOnlyFilter {
    readonly valueType = "listbox";
    readonly controlType = "combobox";
    readonly isLoading = false;
    readonly hasMore = false;

    _value = new Set<string>();
    _attributes: ListAttributeValue[] = [];

    constructor(attributes: ListAttributeValue[]) {
        this._attributes = attributes;

        makeObservable(this, {
            _attributes: observable,
            _value: observable,
            value: computed,
            options: computed,
            universe: computed,
            replace: action,
            toggle: action
        });
    }

    get options(): Array<Option<string>> {
        const options = this._attributes.flatMap(attr =>
            Array.from(attr.universe ?? [], value => {
                const stringValue = `${value}`;
                return {
                    caption: attr.formatter.format(value),
                    value: stringValue,
                    selected: this._value.has(stringValue)
                };
            })
        );

        return options;
    }

    get value(): Set<string> {
        return new Set(this._value);
    }

    get universe(): Set<string> {
        return new Set(this._attributes.flatMap(attr => Array.from(attr.universe ?? [], value => `${value}`)));
    }

    get filterCondition(): FilterCondition | undefined {
        const conditions = this._attributes.flatMap(attr => {
            const cond = getFilterCondition(attr, this._value);
            return cond ? [cond] : [];
        });
        return conditions.length > 1 ? or(...conditions) : conditions[0];
    }

    replace(value: string[]): void {
        this._value = new Set(value);
    }

    toggle(value: string): void {
        if (this._value.delete(value) === false) {
            this._value.add(value);
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

    setSearch(): void {
        console.warn("StaticSelectFilterStore: calling setSearch has no effect.");
    }
}

function getFilterCondition(
    listAttribute: ListAttributeValue | undefined,
    values: Set<string>
): FilterCondition | undefined {
    if (!listAttribute || !listAttribute.filterable || values.size === 0) {
        return undefined;
    }

    const { id, type } = listAttribute;
    const filterAttribute = attribute(id);

    const filters = [...values]
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
