import { DatasourceController } from "@mendix/widget-plugin-grid/query/DatasourceController";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { SortInstruction } from "@mendix/widget-plugin-sorting/types/store";

import { FilterCondition } from "mendix/filters";
import { reaction } from "mobx";

interface ObservableFilterStore {
    filter: FilterCondition | undefined;
}

interface ObservableSortStore {
    sortOrder: SortInstruction[] | undefined;
}

export class QueryParamsController implements ReactiveController {
    private readonly _query: DatasourceController;
    private readonly _filtersHost: ObservableFilterStore;
    private readonly _sortHost: ObservableSortStore;

    constructor(
        host: ReactiveControllerHost,
        query: DatasourceController,
        filters: ObservableFilterStore,
        sort: ObservableSortStore
    ) {
        host.addController(this);

        this._query = query;
        this._filtersHost = filters;
        this._sortHost = sort;
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();
        add(
            reaction(
                () => this._sortHost.sortOrder,
                sortOrder => this._query.setSortOrder(sortOrder),
                { fireImmediately: true }
            )
        );
        add(
            reaction(
                () => this._filtersHost.filter,
                filter => this._query.setFilter(filter),
                { fireImmediately: true }
            )
        );

        return disposeAll;
    }
}
