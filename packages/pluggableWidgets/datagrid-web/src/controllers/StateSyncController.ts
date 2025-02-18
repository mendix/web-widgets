import { compactArray, fromCompactArray, isAnd } from "@mendix/widget-plugin-filtering/condition-utils";
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

interface Header {
    conditions: Array<FilterCondition | undefined>;
}

type StateSyncControllerSpec = {
    query: QueryController;
    columns: Columns;
    header: Header;
};

export class StateSyncController implements ReactiveController {
    private columns: Columns;
    private header: Header;
    private query: QueryController;

    constructor(host: ReactiveControllerHost, spec: StateSyncControllerSpec) {
        host.addController(this);
        this.columns = spec.columns;
        this.header = spec.header;
        this.query = spec.query;

        makeAutoObservable(this, { setup: false });
    }

    private get derivedFilter(): FilterCondition | undefined {
        const { columns, header } = this;

        return and(compactArray(columns.conditions), compactArray(header.conditions));
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
    ): [columns: Array<FilterCondition | undefined>, header: Array<FilterCondition | undefined>] {
        if (!filter) {
            return [[], []];
        }
        if (!isAnd(filter)) {
            return [[], []];
        }
        if (filter.args.length !== 2) {
            return [[], []];
        }
        const [columns, header] = filter.args;
        return [fromCompactArray(columns), fromCompactArray(header)];
    }
}
