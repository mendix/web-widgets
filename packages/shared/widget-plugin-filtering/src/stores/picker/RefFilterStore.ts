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
import { action, computed, makeObservable, observable, reaction, when } from "mobx";
import { flattenRefCond, selectedFromCond } from "../../condition-utils";
import { disposeFx } from "../../mobx-utils";
import { OptionWithState } from "../../typings/OptionWithState";
import { BaseSelectStore } from "./BaseSelectStore";
import { SearchStore } from "./SearchStore";

type ListAttributeId = ListAttributeValue["id"];

export type RefFilterStoreProps = {
    ref: ListReferenceValue | ListReferenceSetValue;
    datasource: ListValue;
    caption: ListExpressionValue;
    searchAttrId?: ListAttributeId;
    fetchOptionsLazy?: boolean;
};

export class RefFilterStore extends BaseSelectStore {
    readonly storeType = "refselect";

    private datasource: ListValue;
    private listRef: ListReferenceValue | ListReferenceSetValue;
    private caption: ListExpressionValue;
    private searchAttrId?: ListAttributeId;
    /**
     * As Ref filter fetch options lazily,
     * we just keep condition and
     * return it if options not loaded yet.
     */
    private readonly initCondArray: Array<EqualsCondition | ContainsCondition>;
    private readonly pageSize = 10;
    private readonly searchSize = 100;
    private fetchReady = false;

    lazyMode: boolean;
    search: SearchStore;

    constructor(props: RefFilterStoreProps, initCond: FilterCondition | null) {
        super();
        this.caption = props.caption;
        this.datasource = props.datasource;
        this.listRef = props.ref;
        this.lazyMode = props.fetchOptionsLazy ?? true;
        this.searchAttrId = props.searchAttrId;
        this.initCondArray = initCond ? flattenRefCond(initCond) : [];
        this.search = new SearchStore();

        if (this.lazyMode) {
            this.datasource.setLimit(0);
        }

        makeObservable<this, "datasource" | "listRef" | "caption" | "searchAttrId" | "fetchReady">(this, {
            datasource: observable.ref,
            listRef: observable.ref,
            caption: observable.ref,
            searchAttrId: observable.ref,
            options: computed,
            allOptions: computed,
            hasMore: computed,
            canSearchInPlace: computed,
            isLoading: computed,
            condition: computed,
            updateProps: action,
            fromViewState: action,
            fetchReady: observable,
            setFetchReady: action,
            setDefaultSelected: action
        });

        if (initCond) {
            this.fromViewState(initCond);
        }
    }

    get canSearchInPlace(): boolean {
        return !!(this.searchAttrId && this.datasource.filter === undefined && !this.hasMore);
    }

    get hasMore(): boolean {
        return this.datasource.hasMoreItems ?? false;
    }

    get isLoading(): boolean {
        return this.datasource.status === "loading";
    }

    get options(): OptionWithState[] {
        const search = this.search.value;
        if (this.canSearchInPlace && search) {
            return this.allOptions.filter(opt => opt.caption.toLowerCase().includes(search.toLowerCase()));
        }

        return this.allOptions;
    }

    get allOptions(): OptionWithState[] {
        const items = this.datasource.items ?? [];
        return items.map(obj => ({
            caption: `${this.caption.get(obj).value}`,
            value: `${obj.id}`,
            selected: this.selected.has(obj.id)
        }));
    }

    get condition(): FilterCondition | undefined {
        if (this.selected.size < 1) {
            return undefined;
        }

        const exp = (guid: string): FilterCondition[] => {
            const items = this.datasource.items ?? [];
            const obj = items.find(o => o.id === guid);

            if (obj && this.listRef.type === "Reference") {
                return [refEquals(this.listRef, obj)];
            } else if (obj && this.listRef.type === "ReferenceSet") {
                return [refContains(this.listRef, [obj])];
            }

            const viewExp = this.initCondArray.find(e => {
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

    setup(): () => void {
        const [disposers, dispose] = disposeFx();

        disposers.push(this.search.setup());
        disposers.push(reaction(...this.searchChangeFx()));

        if (this.lazyMode) {
            disposers.push(
                when(
                    () => this.fetchReady,
                    () => this.loadMore()
                )
            );
        } else {
            this.setFetchReady(true);
            this.loadMore();
        }

        return dispose;
    }

    searchChangeFx(): Parameters<typeof reaction> {
        const data = (): string => this.search.value;

        const effect = (search: string): void => {
            if (!this.searchAttrId || this.canSearchInPlace) {
                return;
            }
            const cond =
                typeof search === "string" && search !== ""
                    ? contains(attribute(this.searchAttrId), literal(search))
                    : undefined;
            this.datasource.setFilter(cond);
            this.datasource.setLimit(this.searchSize);
        };

        return [data, effect, { delay: 300 }];
    }

    setFetchReady(fetchReady: boolean): void {
        this.fetchReady ||= fetchReady;
    }

    setDefaultSelected(defaultSelected?: Iterable<string>): void {
        if (!this.blockSetDefaults && defaultSelected) {
            this.defaultSelected = defaultSelected;
            this.blockSetDefaults = true;
            this.setSelected(defaultSelected);
        }
    }

    updateProps(props: RefFilterStoreProps): void {
        this.listRef = props.ref;
        this.datasource = props.datasource;
        this.caption = props.caption;
    }

    loadMore(): void {
        this.datasource.setLimit(this.datasource.limit + this.pageSize);
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
            this.setSelected(selected);
            this.blockSetDefaults = true;
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
