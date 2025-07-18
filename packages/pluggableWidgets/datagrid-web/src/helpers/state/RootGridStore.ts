import { createContextWithStub, FilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { DatasourceController } from "@mendix/widget-plugin-grid/query/DatasourceController";
import { RefreshController } from "@mendix/widget-plugin-grid/query/RefreshController";
import { BaseControllerHost } from "@mendix/widget-plugin-mobx-kit/BaseControllerHost";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { autorun } from "mobx";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { DatasourceParamsController } from "../../controllers/DatasourceParamsController";
import { DerivedLoaderController } from "../../controllers/DerivedLoaderController";
import { PaginationController } from "../../controllers/PaginationController";
import { ProgressStore } from "../../features/data-export/ProgressStore";
import { StaticInfo } from "../../typings/static-info";
import { ColumnGroupStore } from "./ColumnGroupStore";
import { GridPersonalizationStore } from "./GridPersonalizationStore";

type Gate = DerivedPropsGate<DatagridContainerProps>;

type Spec = {
    gate: Gate;
    exportCtrl: ProgressStore;
};

export class RootGridStore extends BaseControllerHost {
    columnsStore: ColumnGroupStore;
    settingsStore: GridPersonalizationStore;
    staticInfo: StaticInfo;
    exportProgressCtrl: ProgressStore;
    loaderCtrl: DerivedLoaderController;
    paginationCtrl: PaginationController;
    readonly autonomousFilterAPI: FilterAPI;

    private gate: Gate;

    constructor({ gate, exportCtrl }: Spec) {
        super();

        const { props } = gate;
        const [columnsInitFilter, sharedInitFilter] = DatasourceParamsController.unzipFilter(props.datasource.filter);

        this.gate = gate;
        this.staticInfo = {
            name: props.name,
            filtersChannelName: `datagrid/${generateUUID()}`
        };
        const customFilterHost = new CustomFilterHost();
        const query = new DatasourceController(this, { gate });
        this.autonomousFilterAPI = createContextWithStub({
            filterObserver: customFilterHost,
            sharedInitFilter,
            parentChannelName: this.staticInfo.filtersChannelName
        });
        const columns = (this.columnsStore = new ColumnGroupStore(props, this.staticInfo, columnsInitFilter, {
            customFilterHost,
            sharedInitFilter
        }));
        this.settingsStore = new GridPersonalizationStore(props, this.columnsStore, customFilterHost);
        this.paginationCtrl = new PaginationController(this, { gate, query });
        this.exportProgressCtrl = exportCtrl;

        new DatasourceParamsController(this, {
            query,
            columns,
            customFilters: customFilterHost
        });

        new RefreshController(this, {
            query: query.derivedQuery,
            delay: props.refreshInterval * 1000
        });

        this.loaderCtrl = new DerivedLoaderController({
            exp: exportCtrl,
            cols: columns,
            query
        });
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();
        add(super.setup());
        add(this.columnsStore.setup());
        add(() => this.settingsStore.dispose());
        add(autorun(() => this.updateProps(this.gate.props)));

        return disposeAll;
    }

    private updateProps(props: DatagridContainerProps): void {
        this.columnsStore.updateProps(props);
        this.settingsStore.updateProps(props);
    }
}
