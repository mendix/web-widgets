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
import { action, computed, makeObservable, observable, reaction, runInAction } from "mobx";
import { flattenRefCond, selectedFromCond } from "../condition-utils";
import { Option, OptionListFilterInterface } from "../typings/OptionListFilterInterface";
import { FilterData } from "../typings/settings";
import { Dispose } from "../typings/type-utils";
import { isInputData } from "./store-utils";

type ListAttributeId = ListAttributeValue["id"];

export type RefFilterStoreProps = {
    ref: ListReferenceValue | ListReferenceSetValue;
    refOptions: ListValue;
    caption: ListExpressionValue;
    searchAttrId?: ListAttributeId;
    fetchOptionsLazy?: boolean;
};

export class RefFilterStore implements OptionListFilterInterface {
    private _selectedDraft = new Set<string>();
    readonly disposers: Dispose[] = [];
    readonly storeType = "optionlist";
    readonly type = "refselect";
    defaultValue: string[] | undefined = undefined;
    isInitialized = false;
    lazyMode: boolean;
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
    _search = "";
    _searchBuffer = "";

    constructor(props: RefFilterStoreProps, initCond: FilterCondition | null) {
        this._ref = props.ref;
        this._refOptions = props.refOptions;
        this._caption = props.caption;
        this._searchAttrId = props.searchAttrId;
        this._initCondArray = initCond ? flattenRefCond(initCond) : [];
        this.lazyMode = props.fetchOptionsLazy ?? true;

        if (this.lazyMode) {
            this._refOptions.setLimit(0);
        }

        makeObservable<this, "_selectedDraft" | "selected">(this, {
            _ref: observable.ref,
            _refOptions: observable.ref,
            _caption: observable.ref,
            _selectedDraft: observable,
            _search: observable,
            _searchBuffer: observable,

            selected: computed,
            options: computed,
            allOptions: computed,
            hasMore: computed,
            canSearch: computed,
            canSearchInPlace: computed,
            isLoading: computed,
            allIds: computed.struct,
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
        return this._refOptions.hasMoreItems ?? false;
    }

    get isLoading(): boolean {
        return this._refOptions.status === "loading";
    }

    get options(): Option[] {
        const options = this.allOptions;

        if (!this._search) {
            return options;
        }

        if (this.canSearchInPlace) {
            return options.filter(opt => opt.caption.toLowerCase().includes(this._search.toLowerCase()));
        }

        return options;
    }

    get allOptions(): Option[] {
        const items = this._refOptions.items ?? [];
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

        const cond = [...this.selected].flatMap(exp);

        if (cond.length > 1) {
            return or(...cond);
        }

        return cond[0];
    }

    private get selected(): Set<string> {
        let selected = this._selectedDraft;
        if (this.allIds.size > 0) {
            selected = new Set([...selected].filter(id => this.allIds.has(id)));
        }
        return selected;
    }

    get selectedCount(): number {
        return this.selected.size;
    }

    /**
     * Compute list of all ids.
     * Return empty set if full list is not available.
     */
    get allIds(): Set<string> {
        const hasMore = this._refOptions.hasMoreItems ?? true;
        const isLoading = this._refOptions.status === "loading";

        if (hasMore || isLoading) {
            return new Set<string>();
        }

        const items = this._refOptions.items ?? [];
        return new Set(items.map(item => item.id));
    }

    setup(): Dispose {
        this.disposers.push(
            reaction(
                () => this._searchBuffer.trim(),
                search =>
                    runInAction(() => {
                        this._search = search;
                    }),
                { delay: 300 }
            )
        );

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
                    this._refOptions.setFilter(search);
                }
            )
        );

        return () => {
            this.disposers.forEach(dispose => dispose());
            this.disposers.length = 0;
        };
    }

    get searchBuffer(): string {
        return this._searchBuffer;
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
        this._refOptions = props.refOptions;
        this._caption = props.caption;
    }

    replace(value: string[] | Set<string>): void {
        this._selectedDraft = new Set(value);
    }

    toggle(value: string): void {
        if (this._selectedDraft.delete(value) === false) {
            this._selectedDraft.add(value);
        }
    }

    isValidValue(value: unknown): boolean {
        return typeof value === "string";
    }

    loadMore(): void {
        this._refOptions.setLimit(this._refOptions.limit + 30);
    }

    setSearch(value: string | undefined | null): void {
        this._searchBuffer = value ?? "";
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
