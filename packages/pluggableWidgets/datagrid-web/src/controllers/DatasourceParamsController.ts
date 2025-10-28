import { QueryService } from "@mendix/widget-plugin-grid/main";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { SetupComponent, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { FilterCondition } from "mendix/filters";
import { reaction } from "mobx";
import { SortInstruction } from "../typings/sorting";

interface ObservableFilterStore {
    filter: FilterCondition | undefined;
}

interface ObservableSortStore {
    sortInstructions: SortInstruction[] | undefined;
}

export class DatasourceParamsController implements SetupComponent {
    constructor(
        host: SetupComponentHost,
        private query: QueryService,
        private filterHost: ObservableFilterStore,
        private sortHost: ObservableSortStore
    ) {
        host.add(this);
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();
        add(
            reaction(
                () => this.sortHost.sortInstructions,
                sortOrder => this.query.setSortOrder(sortOrder),
                { fireImmediately: true }
            )
        );
        add(
            reaction(
                () => this.filterHost.filter,
                filter => this.query.setFilter(filter),
                { fireImmediately: true }
            )
        );

        return disposeAll;
    }
}
