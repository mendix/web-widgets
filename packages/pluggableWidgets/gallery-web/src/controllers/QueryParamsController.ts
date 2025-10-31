import { DatasourceService } from "@mendix/widget-plugin-grid/main";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { SetupComponent, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { SortInstruction } from "@mendix/widget-plugin-sorting/types/store";

import { FilterCondition } from "mendix/filters";
import { reaction } from "mobx";

interface ObservableFilterStore {
    filter: FilterCondition | undefined;
}

interface ObservableSortStore {
    sortOrder: SortInstruction[] | undefined;
}

export class QueryParamsController implements SetupComponent {
    private readonly _query: DatasourceService;
    private readonly _filtersHost: ObservableFilterStore;
    private readonly _sortHost: ObservableSortStore;

    constructor(
        host: SetupComponentHost,
        query: DatasourceService,
        filters: ObservableFilterStore,
        sort: ObservableSortStore
    ) {
        host.add(this);

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
