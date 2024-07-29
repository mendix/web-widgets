import {
    ListAttributeValue,
    ListExpressionValue,
    ListReferenceSetValue,
    ListReferenceValue,
    ListValue,
    ObjectItem
} from "mendix";
import { ContainsCondition, EqualsCondition, FilterCondition, LiteralExpression } from "mendix/filters";
import { association, contains, empty, equals, literal, or, attribute } from "mendix/filters/builders";
import { action, computed, makeObservable, observable, comparer } from "mobx";
import { Option, OptionListFilterInterface } from "../typings/OptionListFilterInterface";
import { flattenRefCond, selectedFromCond } from "../condition-utils";

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
    /**
     * As Ref filter fetch options lazily,
     * we just keep condition and
     * return it if options not loaded yet.
     */
    readonly _initCond: FilterCondition | undefined;
    readonly _initCondArray: Array<EqualsCondition | ContainsCondition>;

    constructor(props: RefFilterStoreProps, initCond: FilterCondition | null) {
        this._ref = props.ref;
        this._refOptions = props.refOptions;
        this._caption = props.caption;
        this._searchAttrId = props.searchAttrId;
        this._initCondArray = initCond ? flattenRefCond(initCond) : [];

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

        if (initCond) {
            this.fromViewState(initCond);
        }
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

        const exp = (guid: string): FilterCondition[] => {
            const items = this._refOptions.items ?? [];
            const obj = items.find(o => o.id === guid);

            if (obj && this._ref.type === "Reference") {
                return [refEquals(this._ref, obj)];
            } else if (obj && this._ref.type === "ReferenceSet") {
                return [refContains(this._ref, [obj])];
            }

            const viewExp = this._initCondArray.find(e => {
                if (e.arg2.type !== "literal") {
                    return false;
                }
                if (e.arg2.valueType === "Reference") {
                    return e.arg2.value === guid;
                }
                if (e.arg2.valueType === "ReferenceSet") {
                    return e.arg2.value.at(0) === guid;
                }
                return false;
            });
            return viewExp ? [viewExp] : [];
        };

        const cond = [...this._selected].flatMap(exp);

        if (cond.length > 1) {
            return or(...cond);
        }

        return cond[0];
    }

    get selectedCount(): number {
        return this._selected.size;
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

    fromViewState(cond: FilterCondition): void {
        const val = (exp: LiteralExpression): string | undefined => {
            switch (exp.valueType) {
                case "Reference":
                    return exp.value;
                case "ReferenceSet":
                    return exp.value.at(0);
                default:
                    return undefined;
            }
        };

        const selected = selectedFromCond(cond, val);

        if (selected.length > 0) {
            this.replace(selected);
            this.isInitialized = true;
        }
    }
}

export function refEquals(associationValue: ListReferenceValue, value: ObjectItem): EqualsCondition {
    return equals(association(associationValue.id), literal(value));
}

export function refContains(associationValue: ListReferenceSetValue, value: ObjectItem[]): ContainsCondition {
    const v = value.length ? literal(value.slice()) : empty();
    return contains(association(associationValue.id), v);
}
