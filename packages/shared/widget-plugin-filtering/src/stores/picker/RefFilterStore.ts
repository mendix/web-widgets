import {
    ListAttributeValue,
    ListExpressionValue,
    ListReferenceSetValue,
    ListReferenceValue,
    ListValue,
    ObjectItem
} from "mendix";
import { ContainsCondition, EqualsCondition, FilterCondition, LiteralExpression } from "mendix/filters";
import { association, attribute, contains, empty, equals, literal, or } from "mendix/filters/builders";
import { action, computed, makeObservable, observable, reaction } from "mobx";
import { flattenRefCond, selectedFromCond } from "../condition-utils";
import { OptionWithState } from "../typings/BaseSelectStore";
import { FilterData } from "../typings/settings";
import { Dispose } from "../typings/type-utils";
import { isInputData } from "./store-utils";

type ListAttributeId = ListAttributeValue["id"];

export type RefFilterStoreProps = {
    ref: ListReferenceValue | ListReferenceSetValue;
    datasource: ListValue;
    caption: ListExpressionValue;
    searchAttrId?: ListAttributeId;
    fetchOptionsLazy?: boolean;
};

export class RefFilterStore {
    readonly disposers: Dispose[] = [];
    readonly storeType = "refselect";
    readonly type = "refselect";
    readonly _searchAttrId: ListAttributeId | undefined = undefined;
    defaultValue: string[] | undefined = undefined;
    isInitialized = false;
    _search = "";
    _selected = new Set<string>();

    lazyMode: boolean;
    _ref: ListReferenceValue | ListReferenceSetValue;
    _datasource: ListValue;
    _caption: ListExpressionValue;
    /**
     * As Ref filter fetch options lazily,
     * we just keep condition and
     * return it if options not loaded yet.
     */
    readonly _initCond: FilterCondition | undefined;
    readonly _initCondArray: Array<EqualsCondition | ContainsCondition>;

    constructor(props: RefFilterStoreProps, initCond: FilterCondition | null) {
        this._ref = props.ref;
        this._datasource = props.datasource;
        this._caption = props.caption;
        this._searchAttrId = props.searchAttrId;
        this._initCondArray = initCond ? flattenRefCond(initCond) : [];
        this.lazyMode = props.fetchOptionsLazy ?? true;

        if (this.lazyMode) {
            this._datasource.setLimit(0);
        }

        makeObservable(this, {
            _ref: observable.ref,
            _datasource: observable.ref,
            _caption: observable.ref,
            _search: observable,

            selected: computed,
            options: computed,
            allOptions: computed,
            hasMore: computed,
            canSearch: computed,
            canSearchInPlace: computed,
            isLoading: computed,
            replace: action,
            toggle: action,
            updateProps: action,
            fromJSON: action,
            setSearch: action
        });

        if (initCond) {
            this.fromViewState(initCond);
        }
    }

    get canSearch(): boolean {
        return this._searchAttrId !== undefined;
    }

    get canSearchInPlace(): boolean {
        return this.canSearch && !this.hasMore;
    }

    get hasMore(): boolean {
        return this._datasource.hasMoreItems ?? false;
    }

    get isLoading(): boolean {
        return this._datasource.status === "loading";
    }

    get options(): OptionWithState[] {
        const options = this.allOptions;

        if (!this._search) {
            return options;
        }

        if (this.canSearchInPlace) {
            return options.filter(opt => opt.caption.toLowerCase().includes(this._search.toLowerCase()));
        }

        return options;
    }

    get allOptions(): OptionWithState[] {
        const items = this._datasource.items ?? [];
        return items.map(obj => ({
            caption: `${this._caption.get(obj).value}`,
            value: `${obj.id}`,
            selected: this.selected.has(obj.id)
        }));
    }

    get condition(): FilterCondition | undefined {
        if (this.selected.size < 1) {
            return undefined;
        }

        const exp = (guid: string): FilterCondition[] => {
            const items = this._datasource.items ?? [];
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

        const cond = [...this.selected].flatMap(exp);

        if (cond.length > 1) {
            return or(...cond);
        }

        return cond[0];
    }

    get selected(): Set<string> {
        return this._selected;
    }

    setup(): Dispose {
        this.disposers.push(
            reaction(
                () => this._search,
                term => {
                    if (!this._searchAttrId || this.canSearchInPlace) {
                        return;
                    }
                    const search =
                        typeof term === "string" && term !== ""
                            ? contains(attribute(this._searchAttrId), literal(term))
                            : undefined;
                    this._datasource.setFilter(search);
                }
            )
        );

        return () => {
            this.disposers.forEach(dispose => dispose());
            this.disposers.length = 0;
        };
    }

    searchChangeReaction(): Parameters<typeof reaction> {
        const expression = (): string => this._search;
        const effect = (term: string): void => {
            if (!this._searchAttrId || this.canSearchInPlace) {
                return;
            }
            const search =
                typeof term === "string" && term !== ""
                    ? contains(attribute(this._searchAttrId), literal(term))
                    : undefined;
            this._datasource.setFilter(search);
        };

        return [expression, effect, { delay: 300 }];
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
        this._ref = props.ref;
        this._datasource = props.datasource;
        this._caption = props.caption;
    }

    replace(_: string[] | Set<string>): void {}

    toggle(_: string): void {}

    isValidValue(value: unknown): boolean {
        return typeof value === "string";
    }

    loadMore(): void {
        this._datasource.setLimit(this._datasource.limit + 30);
    }

    setSearch(value: string | undefined | null): void {
        this._search = value ?? "";
    }

    toJSON(): string[] {
        return [...this.selected];
    }

    fromJSON(json: FilterData): void {
        if (json === null) {
            return;
        }

        if (isInputData(json)) {
            return;
        }

        this.replace(json);
    }

    setCustomOptions(_: unknown): void {
        //
    }

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
