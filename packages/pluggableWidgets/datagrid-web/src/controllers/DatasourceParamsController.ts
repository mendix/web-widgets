import { reduceArray, restoreArray } from "@mendix/filter-commons/condition-utils";
import { QueryController } from "@mendix/widget-plugin-grid/query/query-controller";
import { fnv1aHash } from "@mendix/widget-plugin-grid/utils/fnv-1a-hash";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { FilterCondition } from "mendix/filters";
import { makeAutoObservable, reaction } from "mobx";
import { SortInstruction } from "../typings/sorting";

interface Columns {
    conditions: Array<FilterCondition | undefined>;
    sortInstructions: SortInstruction[] | undefined;
}

interface FiltersInput {
    conditions: Array<FilterCondition | undefined>;
}

type DatasourceParamsControllerSpec = {
    query: QueryController;
    columns: Columns;
    customFilters: FiltersInput;
    widgetName: string;
};

type FiltersMeta = {
    columnFilters: string;
    customFilters: string;
    combined: string;
};

type CondArray = Array<FilterCondition | undefined>;

export class DatasourceParamsController implements ReactiveController {
    private columns: Columns;
    private query: QueryController;
    private customFilters: FiltersInput;
    readonly widgetName: string;

    constructor(host: ReactiveControllerHost, spec: DatasourceParamsControllerSpec) {
        host.addController(this);
        this.columns = spec.columns;
        this.query = spec.query;
        this.customFilters = spec.customFilters;
        this.widgetName = spec.widgetName;

        makeAutoObservable(this, { setup: false });
    }

    private get derivedFilter(): {
        filter: FilterCondition | undefined;
        meta: FiltersMeta;
        hash: string | null;
    } {
        return this.reduceFilters(this.columns.conditions, this.customFilters.conditions);
    }

    private get derivedSortOrder(): SortInstruction[] | undefined {
        return this.columns.sortInstructions;
    }

    reduceFilters(
        columnFilters: CondArray,
        customFilters: CondArray
    ): {
        filter: FilterCondition | undefined;
        meta: FiltersMeta;
        hash: string | null;
    } {
        const [columnsCond, columnsMeta] = reduceArray(columnFilters);
        const [customCond, customMeta] = reduceArray(customFilters);
        const [filter, combinedMeta] = reduceArray([columnsCond, customCond]);

        const meta: FiltersMeta = { columnFilters: columnsMeta, customFilters: customMeta, combined: combinedMeta };
        const hash = filter ? DatasourceParamsController.filterHash(filter) : null;

        return { filter, meta, hash };
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();
        add(
            reaction(
                () => this.derivedSortOrder,
                sortOrder => this.query.setSortOrder(sortOrder),
                { fireImmediately: true }
            )
        );
        add(
            reaction(
                () => this.derivedFilter,
                (next, prev) => {
                    if (prev && prev.hash) {
                        this.clearFilterMeta(prev.hash);
                    }
                    if (next.hash) {
                        this.saveFilterMeta(next.hash, next.meta);
                    }
                    this.query.setFilter(next.filter);
                },
                { fireImmediately: true }
            )
        );

        return disposeAll;
    }

    dataKey(hash: string): string {
        return DatasourceParamsController.storageKey(this.widgetName, hash);
    }

    clearFilterMeta(hash: string): void {
        sessionStorage.removeItem(this.dataKey(hash));
    }

    saveFilterMeta(hash: string | null, meta: FiltersMeta): void {
        if (!hash) {
            return;
        }

        sessionStorage.setItem(this.dataKey(hash), JSON.stringify(meta));
    }

    readFilterMeta(hash: string): FiltersMeta | null {
        const item = sessionStorage.getItem(this.dataKey(hash));
        if (!item) {
            return null;
        }
        try {
            return JSON.parse(item) as FiltersMeta;
        } catch (e) {
            console.error(`DatasourceParamsController.readFilterMeta: Error parsing meta for hash ${hash}`, e);
            return null;
        }
    }

    static filterHash(filter: FilterCondition): string {
        return fnv1aHash(JSON.stringify(filter)).toString();
    }

    static storageKey(widgetName: string, hash: string): string {
        return `[${widgetName}:${hash}]`;
    }

    static restoreMeta(filter: FilterCondition, widgetName: string): FiltersMeta | null {
        const hash = this.filterHash(filter);
        const key = this.storageKey(widgetName, hash);
        const metaJson = sessionStorage.getItem(key);
        if (!metaJson) {
            return null;
        }
        return JSON.parse(metaJson) as FiltersMeta;
    }

    static unzipFilter(
        filter: FilterCondition | undefined,
        widgetName: string
    ): [columnFilters: Array<FilterCondition | undefined>, customFilters: Array<FilterCondition | undefined>] {
        if (!filter) {
            return [[], []];
        }
        const meta = this.restoreMeta(filter, widgetName);
        if (!meta) {
            return [[], []];
        }

        const [column, custom] = restoreArray(filter, meta.combined);
        const columnFilters = restoreArray(column, meta.columnFilters);
        const customFilters = restoreArray(custom, meta.customFilters);
        return [columnFilters, customFilters];
    }
}
