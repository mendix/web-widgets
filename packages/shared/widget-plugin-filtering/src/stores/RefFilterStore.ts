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
import { action, computed, makeObservable, observable, comparer } from "mobx";
import { Option, OptionListFilterInterface } from "../typings/OptionListFilterInterface";

type ListAttributeId = ListAttributeValue["id"];

export type RefFilterStoreProps = {
    ref: ListReferenceValue | ListReferenceSetValue;
    refOptions: ListValue;
    caption: ListExpressionValue;
    searchAttrId?: ListAttributeId;
};

export class RefFilterStore implements OptionListFilterInterface<string> {
    readonly storeType = "optionlist";
    readonly type = "refselect";
    defaultValue: string[] | undefined = undefined;
    isInitialized = false;

    _selected = new Set<string>();
    _ref: ListReferenceValue | ListReferenceSetValue;
    _refOptions: ListValue;
    _caption: ListExpressionValue;
    readonly _searchAttrId: ListAttributeId | undefined = undefined;

    constructor(props: RefFilterStoreProps) {
        this._ref = props.ref;
        this._refOptions = props.refOptions;
        this._caption = props.caption;
        this._searchAttrId = props.searchAttrId;

        this._refOptions.setLimit(0);

        makeObservable(this, {
            _ref: observable.ref,
            _refOptions: observable.ref,
            _caption: observable.ref,
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
        return this._searchAttrId !== undefined;
    }

    get hasMore(): boolean {
        return this._refOptions.hasMoreItems ?? false;
    }

    get isLoading(): boolean {
        return this._refOptions.status === "loading";
    }

    get options(): Array<Option<string>> {
        const items = this._refOptions.items ?? [];
        return items.map(obj => ({
            caption: `${this._caption.get(obj).value}`,
            value: `${obj.id}`,
            selected: this._selected.has(obj.id)
        }));
    }

    get condition(): FilterCondition | undefined {
        if (this._selected.size < 1) {
            return undefined;
        }
        const items = (this._refOptions.items ?? []).filter(obj => this._selected.has(obj.id));
        if (this._ref.type === "Reference") {
            return referenceEqualsOneOf(this._ref, items);
        }
        return referenceSetContainsOneOf(this._ref, items);
    }

    UNSAFE_setDefaults = (_: string[]): void => {
        console.warn("RefFilterStore: calling UNSAFE_setDefaults has no effect.");
    };

    reset = (): void => {
        this.replace([]);
    };

    clear = (): void => {
        this.reset();
    };

    updateProps(props: RefFilterStoreProps): void {
        if (this._ref !== props.ref) {
            this._ref = props.ref;
        }
        if (this._refOptions !== props.refOptions) {
            this._refOptions = props.refOptions;
        }
        if (this._caption !== props.caption) {
            this._caption = props.caption;
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

    isValidValue(value: unknown): boolean {
        return typeof value === "string";
    }

    loadMore(): void {
        this._refOptions.setLimit(this._refOptions.limit + 30);
    }

    setSearch(term: string | undefined): void {
        if (!this._searchAttrId) {
            return;
        }
        const search =
            typeof term === "string" && term !== ""
                ? contains(attribute(this._searchAttrId), literal(term))
                : undefined;
        this._refOptions.setFilter(search);
    }

    /** Stub */
    toJSON(): null {
        return null;
    }

    /** Stub */
    fromJSON(_: unknown): void {}
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
