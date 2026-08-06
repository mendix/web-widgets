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
                sortOrder => this.applySortOrder(sortOrder),
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

    /**
     * Forward the sort order to the datasource. A stored/restored sort instruction
     * may reference an attribute id that no longer exists in the current app build
     * (attribute ids are regenerated on redeploy). The Mendix runtime rejects such
     * ids from setSortOrder with "invalid attribute id", which — thrown inside a
     * mobx reaction — surfaces as an uncaught reaction error and breaks the widget
     * (WC-3520). Guard against it: on rejection, fall back to the default (unsorted)
     * order so the gallery stays usable.
     */
    private applySortOrder(sortOrder: SortInstruction[] | undefined): void {
        try {
            this.query.setSortOrder(sortOrder);
        } catch (error) {
            console.warn(
                "Gallery: ignoring stored sort order because it references an attribute " +
                    "that is no longer available. Resetting to default sort order.",
                error
            );
            this.query.setSortOrder(undefined);
        }
    }
}
