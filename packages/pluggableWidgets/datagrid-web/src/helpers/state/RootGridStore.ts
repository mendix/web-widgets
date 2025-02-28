import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { HeaderFiltersStore } from "@mendix/widget-plugin-filtering/stores/generic/HeaderFiltersStore";
import { BaseControllerHost } from "@mendix/widget-plugin-mobx-kit/BaseControllerHost";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { autorun, computed } from "mobx";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { DatasourceController } from "../../controllers/DatasourceController";
import { DatasourceParamsController } from "../../controllers/DatasourceParamsController";
import { DerivedLoaderController } from "../../controllers/DerivedLoaderController";
import { PaginationController } from "../../controllers/PaginationController";
import { RefreshController } from "../../controllers/RefreshController";
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
    headerFiltersStore: HeaderFiltersStore;
    settingsStore: GridPersonalizationStore;
    staticInfo: StaticInfo;
    exportProgressCtrl: ProgressStore;
    loaderCtrl: DerivedLoaderController;
    paginationCtrl: PaginationController;

    private gate: Gate;

    constructor({ gate, exportCtrl }: Spec) {
        super();

        const { props } = gate;
        const [columnsInitFilter, headerInitFilter, sharedInitFilter] = DatasourceParamsController.unzipFilter(
            props.datasource.filter
        );

        this.gate = gate;
        this.staticInfo = {
            name: props.name,
            filtersChannelName: `datagrid/${generateUUID()}`
        };
        const filterObserver = new CustomFilterHost();
        const query = new DatasourceController(this, { gate });
        const columns = (this.columnsStore = new ColumnGroupStore(props, this.staticInfo, columnsInitFilter, {
            filterObserver,
            sharedInitFilter
        }));
        const header = (this.headerFiltersStore = new HeaderFiltersStore({
            filterList: props.filterList,
            filterChannelName: this.staticInfo.filtersChannelName,
            headerInitFilter,
            sharedInitFilter,
            filterObserver
        }));
        this.settingsStore = new GridPersonalizationStore(props, this.columnsStore, this.headerFiltersStore);
        this.paginationCtrl = new PaginationController(this, { gate, query });
        this.exportProgressCtrl = exportCtrl;

        new DatasourceParamsController(this, {
            query,
            columns,
            header
        });

        new RefreshController(this, {
            query: computed(() => query.computedCopy),
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
