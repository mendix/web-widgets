import { compactArray, fromCompactArray, isAnd } from "@mendix/widget-plugin-filtering/condition-utils";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { ListValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { and } from "mendix/filters/builders";
import { action, autorun, computed, makeObservable } from "mobx";
import { SortInstruction } from "../typings/sorting";

type Gate = DerivedPropsGate<{ datasource: ListValue }>;

type Spec = {
    gate: Gate;
    columnsCtrl: {
        conditions: Array<FilterCondition | undefined>;
        sortInstructions: SortInstruction[] | undefined;
    };
    headerCtrl: { conditions: Array<FilterCondition | undefined> };
};

export class QueryParamsController implements ReactiveController {
    private gate: Gate;
    private spec: Spec;

    constructor(host: ReactiveControllerHost, spec: Spec) {
        host.addController(this);
        this.spec = spec;
        this.gate = spec.gate;

        makeObservable<this, "derivedFilter" | "setSortOrder" | "setFilter">(this, {
            setSortOrder: action,
            setFilter: action,
            derivedFilter: computed
        });
    }

    private get datasource(): ListValue {
        return this.gate.props.datasource;
    }

    private get derivedFilter(): FilterCondition | undefined {
        const { columnsCtrl, headerCtrl } = this.spec;

        return and(compactArray(columnsCtrl.conditions), compactArray(headerCtrl.conditions));
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();
        const { columnsCtrl } = this.spec;
        add(autorun(() => this.setSortOrder(columnsCtrl.sortInstructions)));
        add(autorun(() => this.setFilter(this.derivedFilter)));

        return disposeAll;
    }

    private setSortOrder(sortInstructions: SortInstruction[] | undefined): void {
        this.datasource.setSortOrder(sortInstructions);
    }

    private setFilter(conditions: FilterCondition | undefined): void {
        this.datasource.setFilter(conditions);
    }

    static getDsViewState({
        datasource
    }: {
        datasource: ListValue;
    }): [columns: Array<FilterCondition | undefined>, header: Array<FilterCondition | undefined>] {
        if (!datasource.filter) {
            return [[], []];
        }
        if (!isAnd(datasource.filter)) {
            return [[], []];
        }
        if (datasource.filter.args.length !== 2) {
            return [[], []];
        }
        const [columns, header] = datasource.filter.args;
        return [fromCompactArray(columns), fromCompactArray(header)];
    }
}
