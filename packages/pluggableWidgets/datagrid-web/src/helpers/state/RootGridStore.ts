import { compactArray, fromCompactArray, isAnd } from "@mendix/widget-plugin-filtering/condition-utils";
import { HeaderFiltersStore } from "@mendix/widget-plugin-filtering/stores/generic/HeaderFiltersStore";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/ReactiveControllerHost";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { FilterCondition } from "mendix/filters";
import { and } from "mendix/filters/builders";
import { action, autorun, isObservable, makeObservable, observable } from "mobx";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { RefreshController } from "../../controllers/RefreshController";
import { ProgressStore } from "../../features/data-export/ProgressStore";
import { SortInstruction } from "../../typings/sorting";
import { StaticInfo } from "../../typings/static-info";
import { ColumnGroupStore } from "./ColumnGroupStore";
import { GridPersonalizationStore } from "./GridPersonalizationStore";
import { HeaderFiltersStore } from "@mendix/widget-plugin-filtering/stores/HeaderFiltersStore";
import { compactArray, fromCompactArray, isAnd } from "@mendix/widget-plugin-filtering/condition-utils";

export class RootGridStore extends ReactiveControllerHost {
    columnsStore: ColumnGroupStore;
    headerFiltersStore: HeaderFiltersStore;
    settingsStore: GridPersonalizationStore;
    progressStore: ProgressStore;
    staticInfo: StaticInfo;
    refresh: RefreshController;
    fun: PropsGate<DatagridContainerProps>;

    constructor(props: DatagridContainerProps) {
        super();
        this.setInitParams(props);
        this.staticInfo = {
            name: props.name,
            filtersChannelName: `datagrid/${generateUUID()}`
        };

        const [columnsViewState, headerViewState] = this.getDsViewState(props);
        this.columnsStore = new ColumnGroupStore(props, this.staticInfo, columnsViewState);
        this.headerFiltersStore = new HeaderFiltersStore(props, this.staticInfo, headerViewState);
        this.settingsStore = new GridPersonalizationStore(props, this.columnsStore, this.headerFiltersStore);
        this.progressStore = new ProgressStore();
        this.refresh = new RefreshController(this, {
            datasource: props.datasource,
            delay: 0
        });
        this.fun = new PropsGate(props);
    }

    get isColumnsLoaded(): boolean {
        return this.columnsStore.loaded;
    }

    /**
     * This method should always "read" filters from columns.
     * Otherwise computed is suspended.
     */
    get conditions(): FilterCondition {
        const columns = this.columnsStore.conditions;
        const header = this.headerFiltersStore.conditions;
        return and(compactArray(columns), compactArray(header));
    }

    get sortInstructions(): SortInstruction[] | undefined {
        return this.columnsStore.sortInstructions;
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();
        add(super.setup());
        add(this.columnsStore.setup());
        add(this.headerFiltersStore.setup() ?? (() => {}));
        add(() => this.settingsStore.dispose());
        add(
            autorun(() => {
                const ps = this.fun.props.datasource.totalCount;
                console.log("RootGridStore.props", "changed");
                console.log("observable?", isObservable(ps));
            })
        );
        add(
            autorun(() => {
                console.log("RootGridStore.isColumnsLoaded", this.isColumnsLoaded);
            })
        );

        return disposeAll;
    }

    private setInitParams(props: DatagridContainerProps): void {
        if (props.pagination === "buttons") {
            props.datasource.requestTotalCount(true);
        }

        // Set initial limit
        props.datasource.setLimit(props.pageSize);
    }

    // Mirror operation from "condition";
    private getDsViewState({
        datasource
    }: DatagridContainerProps):
        | [columns: Array<FilterCondition | undefined>, header: Array<FilterCondition | undefined>] {
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

    updateProps(props: DatagridContainerProps): void {
        if (this.progressStore.exporting) {
            return;
        }
        this.columnsStore.updateProps(props);
        this.settingsStore.updateProps(props);
        this.refresh.updateProps({ datasource: props.datasource });
        this.fun.setProps(props);
    }
}

class PropsGate<T> {
    props: T;
    constructor(props: T) {
        this.props = props;
        makeObservable(this, {
            props: observable.struct,
            setProps: action
        });
    }

    setProps(props: T): void {
        this.props = props;
    }
}
