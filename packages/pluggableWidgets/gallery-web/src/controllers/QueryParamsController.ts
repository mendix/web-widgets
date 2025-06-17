import { compactArray, fromCompactArray, isAnd } from "@mendix/filter-commons/condition-utils";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { DatasourceController } from "@mendix/widget-plugin-grid/query/DatasourceController";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { SortStoreHost } from "@mendix/widget-plugin-sorting/stores/SortStoreHost";
import { ListValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { makeAutoObservable, reaction } from "mobx";

export class QueryParamsController implements ReactiveController {
    private readonly _query: DatasourceController;
    private readonly _filters: CustomFilterHost;
    private readonly _sort: SortStoreHost;

    constructor(
        host: ReactiveControllerHost,
        query: DatasourceController,
        filters: CustomFilterHost,
        sort: SortStoreHost
    ) {
        host.addController(this);

        this._query = query;
        this._filters = filters;
        this._sort = sort;

        makeAutoObservable(this, { setup: false });
    }

    private get _derivedSortOrder(): ListValue["sortOrder"] {
        return this._sort.sortOrder;
    }

    private get _derivedFilter(): FilterCondition {
        return compactArray(this._filters.conditions);
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();
        add(
            reaction(
                () => this._derivedSortOrder,
                sortOrder => this._query.setSortOrder(sortOrder),
                { fireImmediately: true }
            )
        );
        add(
            reaction(
                () => this._derivedFilter,
                filter => this._query.setFilter(filter),
                { fireImmediately: true }
            )
        );

        return disposeAll;
    }

    unzipFilter(filter?: FilterCondition): Array<FilterCondition | undefined> {
        if (!filter || !isAnd(filter)) {
            return [];
        }
        return fromCompactArray(filter);
    }
}
