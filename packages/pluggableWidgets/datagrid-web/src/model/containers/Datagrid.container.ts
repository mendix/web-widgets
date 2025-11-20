import { WidgetFilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CombinedFilter } from "@mendix/widget-plugin-filtering/stores/generic/CombinedFilter";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { emptyStateWidgetsAtom } from "@mendix/widget-plugin-grid/core/models/empty-state.model";
import {
    createClickActionHelper,
    createFocusController,
    createSelectionHelper,
    createSetPageAction,
    createSetPageSizeAction,
    currentPageAtom,
    DatasourceService,
    layoutAtom,
    pageSizeAtom,
    SelectActionsProvider,
    TaskProgressService
} from "@mendix/widget-plugin-grid/main";
import { SelectionCounterViewModel } from "@mendix/widget-plugin-grid/selection-counter/SelectionCounter.viewModel-atoms";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { Container, injected } from "brandi";
import { MainGateProps } from "../../../typings/MainGateProps";
import { WidgetRootViewModel } from "../../features/base/WidgetRoot.viewModel";
import { EmptyPlaceholderViewModel } from "../../features/empty-message/EmptyPlaceholder.viewModel";
import { createCellEventsController } from "../../features/row-interaction/CellEventsController";
import { DynamicPaginationFeature } from "../../features/pagination/DynamicPagination.feature";
import { PageControlService } from "../../features/pagination/PageControl.service";
import { paginationConfig } from "../../features/pagination/pagination.config";
import { customPaginationAtom, dynamicPageAtom, dynamicPageSizeAtom } from "../../features/pagination/pagination.model";
import { PaginationViewModel } from "../../features/pagination/Pagination.viewModel";
import { creteCheckboxEventsController } from "../../features/row-interaction/CheckboxEventsController";
import { SelectAllModule } from "../../features/select-all/SelectAllModule.container";
import { ColumnGroupStore } from "../../helpers/state/ColumnGroupStore";
import { GridBasicData } from "../../helpers/state/GridBasicData";
import { GridPersonalizationStore } from "../../helpers/state/GridPersonalizationStore";
import { DatagridConfig } from "../configs/Datagrid.config";
import { gridStyleAtom } from "../models/grid.model";
import { rowClassProvider } from "../models/rows.model";
import { DatasourceParamsController } from "../services/DatasourceParamsController";
import { DerivedLoaderController } from "../services/DerivedLoaderController";
import { SelectionGate } from "../services/SelectionGate.service";
import { CORE_TOKENS as CORE, DG_TOKENS as DG, SA_TOKENS } from "../tokens";
import { GridSizeStore } from "../stores/GridSize.store";

// base
injected(ColumnGroupStore, CORE.setupService, CORE.mainGate, CORE.config, DG.filterHost);
injected(DatasourceParamsController, CORE.setupService, DG.query, DG.combinedFilter, CORE.columnsStore);
injected(DatasourceService, CORE.setupService, DG.queryGate, DG.refreshInterval.optional);
injected(GridBasicData, CORE.mainGate);
injected(WidgetRootViewModel, CORE.mainGate, CORE.config, DG.exportProgressService, SA_TOKENS.selectionDialogVM);
injected(GridSizeStore, CORE.atoms.hasMoreItems, DG.paginationConfig, DG.setPageAction);

/** Pagination **/
injected(createSetPageAction, DG.query, DG.paginationConfig, DG.currentPage, DG.pageSize);
injected(createSetPageSizeAction, DG.query, DG.paginationConfig, DG.currentPage, CORE.pageSizeStore, DG.setPageAction);
injected(currentPageAtom, DG.query, DG.pageSize, DG.paginationConfig);
injected(dynamicPageAtom, CORE.mainGate, DG.paginationConfig);
injected(dynamicPageSizeAtom, CORE.mainGate);
injected(PageControlService, CORE.mainGate, DG.setPageSizeAction, DG.setPageAction);
injected(pageSizeAtom, CORE.pageSizeStore);
injected(PaginationViewModel, DG.paginationConfig, DG.query, DG.currentPage, DG.pageSize, DG.setPageAction);
injected(
    DynamicPaginationFeature,
    CORE.setupService,
    DG.paginationConfig,
    DG.dynamicPage,
    DG.dynamicPageSize,
    CORE.atoms.totalCount,
    DG.pageControl
);
injected(customPaginationAtom, CORE.mainGate);

// loader
injected(DerivedLoaderController, DG.query, DG.exportProgressService, CORE.columnsStore, DG.loaderConfig);

// filtering
injected(CombinedFilter, CORE.setupService, DG.combinedFilterConfig);
injected(WidgetFilterAPI, DG.parentChannelName, DG.filterHost);

// empty state
injected(emptyStateWidgetsAtom, CORE.mainGate, CORE.atoms.itemCount);
injected(EmptyPlaceholderViewModel, DG.emptyPlaceholderWidgets, CORE.atoms.visibleColumnsCount, CORE.config);

// personalization
injected(GridPersonalizationStore, CORE.setupService, CORE.mainGate, CORE.columnsStore, DG.filterHost);

// selection
injected(SelectionGate, CORE.mainGate);
injected(createSelectionHelper, CORE.setupService, DG.selectionGate, CORE.config.optional);
injected(gridStyleAtom, CORE.columnsStore, CORE.config, DG.gridSizeStore);
injected(rowClassProvider, CORE.mainGate);

// row-interaction
injected(SelectActionsProvider, DG.selectionType, DG.selectionHelper);
injected(createFocusController, CORE.setupService, DG.virtualLayout);
injected(creteCheckboxEventsController, CORE.config, DG.selectActions, DG.focusService, DG.pageSize);
injected(layoutAtom, CORE.atoms.itemCount, CORE.atoms.columnCount, DG.pageSize);
injected(createClickActionHelper, CORE.setupService, CORE.mainGate);
injected(createCellEventsController, CORE.config, DG.selectActions, DG.focusService, DG.clickActionHelper, DG.pageSize);

// selection counter
injected(
    SelectionCounterViewModel,
    CORE.selection.selectedCount,
    CORE.selection.selectedCounterTextsStore,
    DG.selectionCounterCfg.optional
);

export class DatagridContainer extends Container {
    id = `DatagridContainer@${generateUUID()}`;
    constructor(root: Container) {
        super();
        this.extend(root);

        // Basic data store
        this.bind(DG.basicDate).toInstance(GridBasicData).inSingletonScope();
        // Columns store
        this.bind(CORE.columnsStore).toInstance(ColumnGroupStore).inSingletonScope();
        // Query service
        this.bind(DG.query).toInstance(DatasourceService).inSingletonScope();
        // Grid sizing and scrolling store
        this.bind(DG.gridSizeStore).toInstance(GridSizeStore).inSingletonScope();
        // Datasource params service
        this.bind(DG.paramsService).toInstance(DatasourceParamsController).inSingletonScope();
        // FilterAPI
        this.bind(DG.filterAPI).toInstance(WidgetFilterAPI).inSingletonScope();
        // Filter host
        this.bind(DG.filterHost).toInstance(CustomFilterHost).inSingletonScope();
        // Combined filter
        this.bind(DG.combinedFilter).toInstance(CombinedFilter).inSingletonScope();
        // Personalization service
        this.bind(DG.personalizationService).toInstance(GridPersonalizationStore).inSingletonScope();
        // Loader view model
        this.bind(DG.loaderVM).toInstance(DerivedLoaderController).inSingletonScope();
        // Selection counter view model
        this.bind(DG.selectionCounterVM).toInstance(SelectionCounterViewModel).inSingletonScope();
        // Empty placeholder
        this.bind(DG.emptyPlaceholderVM).toInstance(EmptyPlaceholderViewModel).inTransientScope();
        this.bind(DG.emptyPlaceholderWidgets).toInstance(emptyStateWidgetsAtom).inTransientScope();
        // Grid columns style
        this.bind(DG.gridColumnsStyle).toInstance(gridStyleAtom).inTransientScope();

        /** Pagination **/
        this.bind(DG.currentPage).toInstance(currentPageAtom).inTransientScope();
        this.bind(DG.customPagination).toInstance(customPaginationAtom).inTransientScope();
        this.bind(DG.dynamicPage).toInstance(dynamicPageAtom).inTransientScope();
        this.bind(DG.dynamicPageSize).toInstance(dynamicPageSizeAtom).inTransientScope();
        this.bind(DG.dynamicPagination).toInstance(DynamicPaginationFeature).inSingletonScope();
        this.bind(DG.pageSize).toInstance(pageSizeAtom).inTransientScope();
        this.bind(DG.pageControl).toInstance(PageControlService).inSingletonScope();
        this.bind(DG.paginationVM).toInstance(PaginationViewModel).inSingletonScope();
        this.bind(DG.setPageAction).toInstance(createSetPageAction).inSingletonScope();
        this.bind(DG.setPageSizeAction).toInstance(createSetPageSizeAction).inSingletonScope();

        // Selection gate
        this.bind(DG.selectionGate).toInstance(SelectionGate).inTransientScope();
        // Selection helper
        this.bind(DG.selectionHelper).toInstance(createSelectionHelper).inSingletonScope();
        // Row class provider
        this.bind(DG.rowClass).toInstance(rowClassProvider).inTransientScope();
        // Widget root view model
        this.bind(DG.datagridRootVM).toInstance(WidgetRootViewModel).inTransientScope();
        // Select actions provider
        this.bind(DG.selectActions).toInstance(SelectActionsProvider).inSingletonScope();
        // Virtual layout
        this.bind(DG.virtualLayout).toInstance(layoutAtom).inTransientScope();
        // Focus service
        this.bind(DG.focusService).toInstance(createFocusController).inSingletonScope();
        // Checkbox events service
        this.bind(DG.checkboxEventsHandler).toInstance(creteCheckboxEventsController).inSingletonScope();
        // Cell events service
        this.bind(DG.cellEventsHandler).toInstance(createCellEventsController).inSingletonScope();
        // Click action helper
        this.bind(DG.clickActionHelper).toInstance(createClickActionHelper).inSingletonScope();
    }

    /**
     * Setup container constants. If possible, declare all other bindings in the constructor.
     * @remark Make sure not to bind things that already exist in root container.
     */
    init(dependencies: {
        props: MainGateProps;
        config: DatagridConfig;
        mainGate: DerivedPropsGate<MainGateProps>;
        exportProgressService: TaskProgressService;
        selectAllModule: SelectAllModule;
    }): DatagridContainer {
        const { props, config, mainGate, exportProgressService, selectAllModule } = dependencies;

        // Main gate

        this.bind(CORE.mainGate).toConstant(mainGate);
        this.bind(DG.queryGate).toConstant(mainGate);

        // Export progress service
        this.bind(DG.exportProgressService).toConstant(exportProgressService);

        // Config
        this.bind(CORE.config).toConstant(config);

        // Connect select all module
        this.bind(SA_TOKENS.progressService).toConstant(selectAllModule.get(SA_TOKENS.progressService));
        this.bind(SA_TOKENS.selectionDialogVM).toConstant(selectAllModule.get(SA_TOKENS.selectionDialogVM));
        this.bind(SA_TOKENS.selectAllBarVM).toConstant(selectAllModule.get(SA_TOKENS.selectAllBarVM));

        // Events channel for child widgets
        this.bind(DG.parentChannelName).toConstant(config.filtersChannelName);

        // Bind refresh interval
        this.bind(DG.refreshInterval).toConstant(config.refreshIntervalMs);

        // Bind combined filter config
        this.bind(DG.combinedFilterConfig).toConstant({
            stableKey: props.name,
            inputs: [this.get(DG.filterHost), this.get(CORE.columnsStore)]
        });

        // Bind loader config
        this.bind(DG.loaderConfig).toConstant({
            showSilentRefresh: props.refreshInterval > 1,
            refreshIndicator: props.refreshIndicator
        });

        // Bind pagination config

        this.bind(DG.paginationConfig).toConstant(paginationConfig(props));

        // Bind init page size
        this.bind(CORE.initPageSize).toConstant(props.pageSize);

        // Bind selection counter position
        this.bind(DG.selectionCounterCfg).toConstant({ position: props.selectionCounterPosition });

        // Bind selection type
        this.bind(DG.selectionType).toConstant(config.selectionType);

        this.postInit(props, config);

        return this;
    }

    /** Post init hook for final configuration. */
    private postInit(props: MainGateProps, config: DatagridConfig): void {
        // Make sure essential services are created upfront
        this.get(DG.paramsService); // Enable sort & filtering
        this.get(DG.dynamicPagination); // Enable dynamic pagination feature

        const query = this.get(DG.query);
        const pgConfig = this.get(DG.paginationConfig);
        query.requestTotalCount(pgConfig.requestTotalCount);
        query.setBaseLimit(pgConfig.constPageSize);

        if (config.settingsStorageEnabled) {
            this.get(DG.personalizationService);
        }

        if (config.selectionEnabled) {
            // Create selection helper singleton
            this.get(DG.selectionHelper);
        } else {
            // Override selection helper with undefined to disable selection features
            this.bind(DG.selectionHelper).toConstant(null);
        }

        // Hydrate filters from props
        this.get(DG.combinedFilter).hydrate(props.datasource.filter);

        this.get(DG.gridSizeStore);
    }
}
