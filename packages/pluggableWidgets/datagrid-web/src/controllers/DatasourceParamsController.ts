import { compactArray, fromCompactArray, isAnd } from "@mendix/filter-commons/condition-utils";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { FilterCondition } from "mendix/filters";
import { and } from "mendix/filters/builders";
import { makeAutoObservable, reaction } from "mobx";
import { SortInstruction } from "../typings/sorting";
import { QueryController } from "./query-controller";

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
};

export class DatasourceParamsController implements ReactiveController {
    private columns: Columns;
    private query: QueryController;
    private customFilters: FiltersInput;

    constructor(host: ReactiveControllerHost, spec: DatasourceParamsControllerSpec) {
        host.addController(this);
        this.columns = spec.columns;
        this.query = spec.query;
        this.customFilters = spec.customFilters;

        makeAutoObservable(this, { setup: false });
    }

    private get derivedFilter(): FilterCondition | undefined {
        const { columns, customFilters } = this;

        return and(compactArray(columns.conditions), compactArray(customFilters.conditions));
    }

    private get derivedSortOrder(): SortInstruction[] | undefined {
        return this.columns.sortInstructions;
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
                filter => this.query.setFilter(filter),
                { fireImmediately: true }
            )
        );

        return disposeAll;
    }

    static unzipFilter(
        filter?: FilterCondition
    ): [columns: Array<FilterCondition | undefined>, sharedFilter: Array<FilterCondition | undefined>] {
        if (!filter) {
            return [[], []];
        }
        if (!isAnd(filter)) {
            return [[], []];
        }
        if (filter.args.length !== 2) {
            return [[], []];
        }

        const [columns, shared] = filter.args;
        return [fromCompactArray(columns), fromCompactArray(shared)];
    }
}
