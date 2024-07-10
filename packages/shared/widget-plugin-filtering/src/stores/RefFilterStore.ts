import {
    ListAttributeValue,
    ListExpressionValue,
    ListReferenceSetValue,
    ListReferenceValue,
    ListValue,
    ObjectItem
} from "mendix";
import { ContainsCondition, EqualsCondition, FilterCondition } from "mendix/filters";
import { association, contains, empty, equals, literal, or, attribute } from "mendix/filters/builders";
import { action, computed, makeObservable, observable } from "mobx";
import { Option, OptionListFilterInterface } from "./typings/OptionListFilterInterface";

type Props = {
    reference: ListReferenceValue | ListReferenceSetValue;
    optionsource: ListValue;
    captionExp: ListExpressionValue;
    searchAttr?: ListAttributeValue;
};

export class RefFilterStore implements OptionListFilterInterface<string> {
    readonly storeType = "optionlist";

    _selected = new Set<string>();
    _reference: ListReferenceValue | ListReferenceSetValue;
    _optionsource: ListValue;
    _captionExp: ListExpressionValue;
    _searchAttr: ListAttributeValue | undefined = undefined;

    constructor(props: Props) {
        this._reference = props.reference;
        this._optionsource = props.optionsource;
        this._captionExp = props.captionExp;
        this._searchAttr = props.searchAttr;

        this._optionsource.setLimit(0);

        makeObservable(this, {
            _reference: observable.ref,
            _optionsource: observable.ref,
            _captionExp: observable.ref,
            _selected: observable,

            options: computed,
            hasMore: computed,
            isLoading: computed,
            replace: action,
            toggle: action,
            updateProps: action
        });
    }

    get hasSearch(): boolean {
        return this._searchAttr !== undefined;
    }

    get hasMore(): boolean {
        return this._optionsource.hasMoreItems ?? false;
    }

    get isLoading(): boolean {
        return this._optionsource.status === "loading";
    }

    get options(): Array<Option<string>> {
        const items = this._optionsource.items ?? [];
        return items.map(obj => ({
            caption: `${this._captionExp.get(obj).value}`,
            value: `${obj.id}`,
            selected: this._selected.has(obj.id)
        }));
    }

    get filterCondition(): FilterCondition | undefined {
        if (this._selected.size < 1) {
            return undefined;
        }
        const items = (this._optionsource.items ?? []).filter(obj => this._selected.has(obj.id));
        if (this._reference.type === "Reference") {
            return referenceEqualsOneOf(this._reference, items);
        }
        return referenceSetContainsOneOf(this._reference, items);
    }

    updateProps(props: Props): void {
        this._reference = props.reference;
        this._optionsource = props.optionsource;
        this._captionExp = props.captionExp;
        this._searchAttr = props.searchAttr;
    }

    replace(value: string[]): void {
        this._selected = new Set(value);
    }

    toggle(value: string): void {
        if (this._selected.delete(value) === false) {
            this._selected.add(value);
        }
    }

    isValidValue(value: unknown): boolean {
        return typeof value === "string";
    }

    loadMore(): void {
        this._optionsource.setLimit(this._optionsource.limit + 100);
    }

    setSearch(term: string | undefined): void {
        const search =
            this._searchAttr && typeof term === "string" && term !== ""
                ? contains(attribute(this._searchAttr.id), literal(term))
                : undefined;
        this._optionsource.setFilter(search);
    }
}

export function referenceEqualsCondition(associationValue: ListReferenceValue, value: ObjectItem): EqualsCondition {
    return equals(association(associationValue.id), literal(value));
}

export function referenceSetContainsCondition(
    associationValue: ListReferenceSetValue,
    value: ObjectItem[]
): ContainsCondition {
    const v = value.length ? literal(value.slice()) : empty();
    return contains(association(associationValue.id), v);
}

export function referenceEqualsOneOf(association: ListReferenceValue, values: ObjectItem[]): FilterCondition {
    const expressions = values.map(value => referenceEqualsCondition(association, value));

    if (expressions.length > 1) {
        return or(...expressions);
    }

    return expressions[0];
}

export function referenceSetContainsOneOf(association: ListReferenceSetValue, values: ObjectItem[]): FilterCondition {
    const expressions = values.map(value => referenceSetContainsCondition(association, [value]));

    if (expressions.length > 1) {
        return or(...expressions);
    }

    return expressions[0];
}
