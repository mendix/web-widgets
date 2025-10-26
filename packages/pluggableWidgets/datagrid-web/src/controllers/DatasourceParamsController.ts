import { QueryController } from "@mendix/widget-plugin-grid/query/query-controller";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { FilterCondition } from "mendix/filters";
import { reaction } from "mobx";
import { SortInstruction } from "../typings/sorting";

interface ObservableFilterStore {
    filter: FilterCondition | undefined;
}

interface ObservableSortStore {
    sortInstructions: SortInstruction[] | undefined;
}

export class DatasourceParamsController implements ReactiveController {
    constructor(
        host: ReactiveControllerHost,
        private query: QueryController,
        private filterHost: ObservableFilterStore,
        private sortHost: ObservableSortStore
    ) {
        host.addController(this);
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
