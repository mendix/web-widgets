import { WidgetFilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CombinedFilter } from "@mendix/widget-plugin-filtering/stores/generic/CombinedFilter";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { emptyStateWidgetsAtom } from "@mendix/widget-plugin-grid/core/models/empty-state.model";
import {
    createClickActionHelper,
    createFocusController,
    createSelectionHelper,
    DatasourceService,
    layoutAtom,
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
import { PaginationController } from "../services/PaginationController";
import { SelectionGate } from "../services/SelectionGate.service";
import { CORE_TOKENS as CORE, DG_TOKENS as DG, SA_TOKENS } from "../tokens";

// base
injected(ColumnGroupStore, CORE.setupService, CORE.mainGate, CORE.config, DG.filterHost);
injected(DatasourceParamsController, CORE.setupService, DG.query, DG.combinedFilter, CORE.columnsStore);
injected(DatasourceService, CORE.setupService, DG.queryGate, DG.refreshInterval.optional);
injected(PaginationController, CORE.setupService, DG.paginationConfig, DG.query);
injected(GridBasicData, CORE.mainGate);
injected(WidgetRootViewModel, CORE.mainGate, CORE.config, DG.exportProgressService, SA_TOKENS.progressService);

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
injected(gridStyleAtom, CORE.columnsStore, CORE.config);
injected(rowClassProvider, CORE.mainGate);

// row-interaction
injected(SelectActionsProvider, DG.selectionType, DG.selectionHelper);
injected(createFocusController, CORE.setupService, DG.virtualLayout);
injected(creteCheckboxEventsController, CORE.config, DG.selectActions, DG.focusService, CORE.atoms.pageSize);
injected(layoutAtom, CORE.atoms.itemCount, CORE.atoms.columnCount, CORE.atoms.pageSize);
injected(createClickActionHelper, CORE.setupService, CORE.mainGate);

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
        // Pagination service
        this.bind(DG.paginationService).toInstance(PaginationController).inSingletonScope();
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
        this.bind(DG.paginationConfig).toConstant({
            pagination: props.pagination,
            showPagingButtons: props.showPagingButtons,
            showNumberOfRows: props.showNumberOfRows,
            pageSize: props.pageSize
        });

        // Bind init page size
        this.bind(CORE.initPageSize).toConstant(props.pageSize);

        // Bind selection counter position
        this.bind(DG.selectionCounterCfg).toConstant({ position: props.selectionCounterPosition });

        this.postInit(props, config);

        return this;
    }

    /** Post init hook for final configuration. */
    private postInit(props: MainGateProps, config: DatagridConfig): void {
        // Make sure essential services are created upfront
        this.get(DG.paramsService);
        this.get(DG.paginationService);

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
    }
}
