import { QueryService } from "@mendix/widget-plugin-grid/main";
import { disposeBatch, SetupComponent, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { SortInstruction } from "@mendix/widget-plugin-sorting/types/store";
import { FilterCondition } from "mendix/filters";
import { reaction } from "mobx";

interface ObservableFilterStore {
    filter: FilterCondition | undefined;
}

interface ObservableSortStore {
    sortOrder: SortInstruction[] | undefined;
}

export class QueryParamsService implements SetupComponent {
    constructor(
        host: SetupComponentHost,
        private query: QueryService,
        private filters: ObservableFilterStore,
        private sort: ObservableSortStore
    ) {
        host.add(this);
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();
        add(
            reaction(
                () => this.sort.sortOrder,
                sortOrder => this.query.setSortOrder(sortOrder),
                { fireImmediately: true }
            )
        );
        add(
            reaction(
                () => this.filters.filter,
                filter => this.query.setFilter(filter),
                { fireImmediately: true }
            )
        );

        return disposeAll;
    }
}
