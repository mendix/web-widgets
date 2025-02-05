import { HeaderFiltersStore } from "@mendix/widget-plugin-filtering/stores/generic/HeaderFiltersStore";
import { BaseControllerHost } from "@mendix/widget-plugin-mobx-kit/BaseControllerHost";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { autorun } from "mobx";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { LoaderController } from "../../controllers/LoaderController";
import { PaginationController } from "../../controllers/PaginationController";
import { QueryParamsController } from "../../controllers/QueryParamsController";
import { RefreshController } from "../../controllers/RefreshController";
import { ProgressStore } from "../../features/data-export/ProgressStore";
import { StaticInfo } from "../../typings/static-info";
import { ColumnGroupStore } from "./ColumnGroupStore";
import { GridPersonalizationStore } from "./GridPersonalizationStore";
import { HeaderFiltersStore } from "@mendix/widget-plugin-filtering/stores/HeaderFiltersStore";
import { compactArray, fromCompactArray, isAnd } from "@mendix/widget-plugin-filtering/condition-utils";

type Gate = DerivedPropsGate<DatagridContainerProps>;

type Spec = {
    gate: Gate;
    exportCtrl: ProgressStore;
};

export class RootGridStore extends BaseControllerHost {
    columnsStore: ColumnGroupStore;
    headerFiltersStore: HeaderFiltersStore;
    settingsStore: GridPersonalizationStore;
    staticInfo: StaticInfo;
    exportProgressCtrl: ProgressStore;
    loaderCtrl: LoaderController;
    paginationCtrl: PaginationController;

    private gate: Gate;

    constructor({ gate, exportCtrl }: Spec) {
        super();

        const { props } = gate;
        const [columnsViewState, headerViewState] = QueryParamsController.getDsViewState(props);

        this.gate = gate;
        this.staticInfo = {
            name: props.name,
            filtersChannelName: `datagrid/${generateUUID()}`
        };
        this.paginationCtrl = new PaginationController(this, { gate });
        this.exportProgressCtrl = exportCtrl;
        this.columnsStore = new ColumnGroupStore(props, this.staticInfo, columnsViewState);
        this.headerFiltersStore = new HeaderFiltersStore(props, this.staticInfo, headerViewState);
        this.settingsStore = new GridPersonalizationStore(props, this.columnsStore, this.headerFiltersStore);

        new QueryParamsController(this, { gate, columnsCtrl: this.columnsStore, headerCtrl: this.headerFiltersStore });

        const refreshCtrl = new RefreshController(this, {
            gate,
            delay: props.refreshInterval
        });

        this.loaderCtrl = new LoaderController(this, {
            gate,
            exp: this.exportProgressCtrl,
            cols: this.columnsStore,
            refresh: refreshCtrl
        });
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();
        add(super.setup());
        add(this.columnsStore.setup());
        add(this.headerFiltersStore.setup() ?? (() => {}));
        add(() => this.settingsStore.dispose());
        add(autorun(() => this.updateProps(this.gate.props)));

        return disposeAll;
    }

    private updateProps(props: DatagridContainerProps): void {
        this.columnsStore.updateProps(props);
        this.settingsStore.updateProps(props);
    }
}
