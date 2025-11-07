import { WidgetFilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CombinedFilter } from "@mendix/widget-plugin-filtering/stores/generic/CombinedFilter";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { itemCountAtom } from "@mendix/widget-plugin-grid/core/models/datasource.model";
import { emptyStateWidgetsAtom } from "@mendix/widget-plugin-grid/core/models/empty-state.model";
import { DatasourceService, ProgressService, SelectionCounterViewModel } from "@mendix/widget-plugin-grid/main";
import { ClosableGateProvider } from "@mendix/widget-plugin-mobx-kit/ClosableGateProvider";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { Container } from "brandi";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { MainGateProps } from "../../../typings/MainGateProps";
import { SelectAllBarViewModel } from "../../features/select-all/SelectAllBar.viewModel";
import { SelectionProgressDialogViewModel } from "../../features/select-all/SelectionProgressDialog.viewModel";
import { ColumnGroupStore } from "../../helpers/state/ColumnGroupStore";
import { GridBasicData } from "../../helpers/state/GridBasicData";
import { GridPersonalizationStore } from "../../helpers/state/GridPersonalizationStore";
import { DatagridConfig, datagridConfig } from "../configs/Datagrid.config";
import { visibleColumnsCountAtom } from "../models/columns.model";
import { DatasourceParamsController } from "../services/DatasourceParamsController";
import { DerivedLoaderController } from "../services/DerivedLoaderController";
import { PaginationController } from "../services/PaginationController";
import { TOKENS } from "../tokens";

export class DatagridContainer extends Container {
    id = `DatagridContainer@${generateUUID()}`;
    /**
     * Setup container bindings.
     * @remark Make sure not to bind things that already exist in root container.
     */
    init(props: DatagridContainerProps, root: Container, selectAllModule: Container): DatagridContainer {
        this.extend(root);

        // Connect select all module
        const selectAllService = selectAllModule.get(TOKENS.selectAllService);
        const selectAllProgress = selectAllModule.get(TOKENS.selectAllProgressService);
        // Bind select all service
        this.bind(TOKENS.selectAllService).toConstant(selectAllService);
        // Bind select all progress
        this.bind(TOKENS.selectAllProgressService).toConstant(selectAllProgress);

        // Create main gate
        this.bind(TOKENS.exportProgressService).toInstance(ProgressService).inSingletonScope();
        const exportProgress = this.get(TOKENS.exportProgressService);
        const gateProvider = new ClosableGateProvider<MainGateProps>(props, function isLocked() {
            return exportProgress.inProgress || selectAllProgress.inProgress;
        });
        this.setProps = props => gateProvider.setProps(props);

        // Bind main gate
        this.bind(TOKENS.mainGate).toConstant(gateProvider.gate);
        this.bind(TOKENS.queryGate).toConstant(gateProvider.gate);

        // Bind config
        const config = datagridConfig(props);
        this.bind(TOKENS.config).toConstant(config);

        // Columns store
        this.bind(TOKENS.columnsStore).toInstance(ColumnGroupStore).inSingletonScope();

        // Basic data store
        this.bind(TOKENS.basicDate).toInstance(GridBasicData).inSingletonScope();

        // Combined filter
        this.bind(TOKENS.combinedFilter).toInstance(CombinedFilter).inSingletonScope();

        // Export progress
        this.bind(TOKENS.exportProgressService).toInstance(ProgressService).inSingletonScope();

        // FilterAPI
        this.bind(TOKENS.filterAPI).toInstance(WidgetFilterAPI).inSingletonScope();

        // Filter host
        this.bind(TOKENS.filterHost).toInstance(CustomFilterHost).inSingletonScope();

        // Datasource params service
        this.bind(TOKENS.paramsService).toInstance(DatasourceParamsController).inSingletonScope();

        // Personalization service
        this.bind(TOKENS.personalizationService).toInstance(GridPersonalizationStore).inSingletonScope();

        // Query service
        this.bind(TOKENS.query).toInstance(DatasourceService).inSingletonScope();

        // Pagination service
        this.bind(TOKENS.paginationService).toInstance(PaginationController).inSingletonScope();

        // Events channel for child widgets
        this.bind(TOKENS.parentChannelName).toConstant(config.filtersChannelName);

        // Loader view model
        this.bind(TOKENS.loaderVM).toInstance(DerivedLoaderController).inSingletonScope();

        // Selection counter view model
        this.bind(TOKENS.selectionCounterVM).toInstance(SelectionCounterViewModel).inSingletonScope();

        // Select all bar view model
        this.bind(TOKENS.selectAllBarVM).toInstance(SelectAllBarViewModel).inSingletonScope();

        // Selection progress dialog view model
        this.bind(TOKENS.selectionDialogVM).toInstance(SelectionProgressDialogViewModel).inSingletonScope();

        // Bind refresh interval
        this.bind(TOKENS.refreshInterval).toConstant(props.refreshInterval * 1000);

        // Bind combined filter config
        this.bind(TOKENS.combinedFilterConfig).toConstant({
            stableKey: props.name,
            inputs: [this.get(TOKENS.filterHost), this.get(TOKENS.columnsStore)]
        });

        // Bind loader config
        this.bind(TOKENS.loaderConfig).toConstant({
            showSilentRefresh: props.refreshInterval > 1,
            refreshIndicator: props.refreshIndicator
        });

        // Bind pagination config
        this.bind(TOKENS.paginationConfig).toConstant({
            pagination: props.pagination,
            showPagingButtons: props.showPagingButtons,
            showNumberOfRows: props.showNumberOfRows,
            pageSize: props.pageSize
        });

        // Bind selection counter position
        this.bind(TOKENS.selectionCounterPosition).toConstant(props.selectionCounterPosition);

        // Bind select all enabled flag
        this.bind(TOKENS.enableSelectAll).toConstant(props.enableSelectAll);

        // Atoms
        this.bind(TOKENS.visibleColumnsCount).toInstance(visibleColumnsCountAtom).inTransientScope();
        this.bind(TOKENS.visibleRowCount).toInstance(itemCountAtom).inTransientScope();
        this.bind(TOKENS.emptyPlaceholderWidgets).toInstance(emptyStateWidgetsAtom).inTransientScope();

        this.postInit(props, config);

        return this;
    }

    /** Post init hook for final configuration. */
    private postInit(props: DatagridContainerProps, config: DatagridConfig): void {
        // Make sure essential services are created upfront
        this.get(TOKENS.paramsService);
        this.get(TOKENS.paginationService);

        if (config.settingsStorageEnabled) {
            this.get(TOKENS.personalizationService);
        }

        // Hydrate filters from props
        this.get(TOKENS.combinedFilter).hydrate(props.datasource.filter);
    }

    setProps = (_props: MainGateProps): void => {
        throw new Error(`${this.id} is not initialized yet`);
    };
}
