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
import {
    createSetPageAction,
    createSetPageSizeAction,
    currentPageAtom,
    customPaginationAtom,
    dynamicPageAtom,
    dynamicPageSizeAtom,
    DynamicPaginationFeature,
    PageControlService,
    pageSizeAtom,
    PaginationViewModel
} from "@mendix/widget-plugin-grid/pagination/main";
import { SelectionCounterViewModel } from "@mendix/widget-plugin-grid/selection-counter/SelectionCounter.viewModel-atoms";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { Container, injected } from "brandi";
import { MainGateProps } from "../../../typings/MainGateProps";
import { WidgetRootViewModel } from "../../features/base/WidgetRoot.viewModel";
import { EmptyPlaceholderViewModel } from "../../features/empty-message/EmptyPlaceholder.viewModel";
import { paginationConfig } from "../../features/pagination/pagination.config";
import { createCellEventsController } from "../../features/row-interaction/CellEventsController";
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
import { GridSizeStore } from "../stores/GridSize.store";
import { CORE_TOKENS as CORE, DG_TOKENS as DG, SA_TOKENS } from "../tokens";

interface InitDependencies {
    props: MainGateProps;
    mainGate: DerivedPropsGate<MainGateProps>;
    config: DatagridConfig;
    exportProgressService: TaskProgressService;
    selectAllModule: SelectAllModule;
}

/** Just little utility object to group related bindings */
interface BindingGroup {
    /** Runs during container constructor. Use this hook to add new binding to the container. */
    define?(container: Container): void;
    /** Runs on container init with deps. Use this hook to bind constants, configs and values that depend on props. */
    init?(container: Container, deps: InitDependencies): void;
    /** This method runs after init phase. Use this hook to init instances and other "bootstrapping" work. */
    postInit?(container: Container, deps: InitDependencies): void;
    /** This method runs only once. Should be used to inject dependencies. */
    inject?(): void;
}

const _01_coreBindings: BindingGroup = {
    inject() {
        injected(ColumnGroupStore, CORE.setupService, CORE.mainGate, CORE.config, DG.filterHost);
        injected(DatasourceParamsController, CORE.setupService, DG.query, DG.combinedFilter, CORE.columnsStore);
        injected(DatasourceService, CORE.setupService, DG.queryGate, DG.refreshInterval.optional);
        injected(GridBasicData, CORE.mainGate);
        injected(
            WidgetRootViewModel,
            CORE.mainGate,
            CORE.config,
            DG.exportProgressService,
            SA_TOKENS.selectionDialogVM
        );
        injected(GridSizeStore, CORE.atoms.hasMoreItems, DG.paginationConfig, DG.setPageAction);
    },
    define(container: Container) {
        container.bind(DG.basicDate).toInstance(GridBasicData).inSingletonScope();
        container.bind(CORE.columnsStore).toInstance(ColumnGroupStore).inSingletonScope();
        container.bind(DG.query).toInstance(DatasourceService).inSingletonScope();
        container.bind(DG.gridSizeStore).toInstance(GridSizeStore).inSingletonScope();
        container.bind(DG.paramsService).toInstance(DatasourceParamsController).inSingletonScope();
        container.bind(DG.datagridRootVM).toInstance(WidgetRootViewModel).inTransientScope();
    },
    init(container, { mainGate, config, exportProgressService }) {
        container.bind(CORE.mainGate).toConstant(mainGate);
        container.bind(DG.queryGate).toConstant(mainGate);
        container.bind(CORE.config).toConstant(config);
        container.bind(DG.exportProgressService).toConstant(exportProgressService);
        container.bind(DG.refreshInterval).toConstant(config.refreshIntervalMs);
    },
    postInit(container) {
        // Make sure essential services are created upfront
        container.get(DG.paramsService); // Enable sort & filtering
        container.get(DG.gridSizeStore);
    }
};

const _02_filterBindings: BindingGroup = {
    inject() {
        injected(CombinedFilter, CORE.setupService, DG.combinedFilterConfig);
        injected(WidgetFilterAPI, DG.parentChannelName, DG.filterHost);
    },
    define(container: Container) {
        container.bind(DG.filterAPI).toInstance(WidgetFilterAPI).inSingletonScope();
        container.bind(DG.filterHost).toInstance(CustomFilterHost).inSingletonScope();
        container.bind(DG.combinedFilter).toInstance(CombinedFilter).inSingletonScope();
    },
    init(container, { props, config }) {
        container.bind(DG.parentChannelName).toConstant(config.filtersChannelName);
        container.bind(DG.combinedFilterConfig).toConstant({
            stableKey: props.name,
            inputs: [container.get(DG.filterHost), container.get(CORE.columnsStore)]
        });
    },
    postInit(container, { props }) {
        // Hydrate filters from props
        container.get(DG.combinedFilter).hydrate(props.datasource.filter);
    }
};

const _03_loaderBindings: BindingGroup = {
    inject() {
        injected(DerivedLoaderController, DG.query, DG.exportProgressService, CORE.columnsStore, DG.loaderConfig);
    },
    define(container: Container) {
        container.bind(DG.loaderVM).toInstance(DerivedLoaderController).inSingletonScope();
    },
    init(container, { props }) {
        container.bind(DG.loaderConfig).toConstant({
            showSilentRefresh: props.refreshInterval > 1,
            refreshIndicator: props.refreshIndicator
        });
    }
};

const _04_emptyStateBindings: BindingGroup = {
    inject() {
        injected(emptyStateWidgetsAtom, CORE.mainGate, CORE.atoms.itemCount);
        injected(EmptyPlaceholderViewModel, DG.emptyPlaceholderWidgets, CORE.atoms.visibleColumnsCount, CORE.config);
    },
    define(container: Container) {
        container.bind(DG.emptyPlaceholderVM).toInstance(EmptyPlaceholderViewModel).inTransientScope();
        container.bind(DG.emptyPlaceholderWidgets).toInstance(emptyStateWidgetsAtom).inTransientScope();
    }
};

const _05_personalizationBindings: BindingGroup = {
    inject() {
        injected(GridPersonalizationStore, CORE.setupService, CORE.mainGate, CORE.columnsStore, DG.filterHost);
    },
    define(container: Container) {
        container.bind(DG.personalizationService).toInstance(GridPersonalizationStore).inSingletonScope();
    },
    postInit(container, { config }) {
        // Enable personalization if configured
        if (config.settingsStorageEnabled) {
            container.get(DG.personalizationService);
        }
    }
};

const _06_paginationBindings: BindingGroup = {
    inject() {
        injected(createSetPageAction, DG.query, DG.paginationConfig, DG.currentPage, DG.pageSize);
        injected(
            createSetPageSizeAction,
            DG.query,
            DG.paginationConfig,
            DG.currentPage,
            CORE.pageSizeStore,
            DG.setPageAction
        );
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
    },
    define(container: Container) {
        container.bind(DG.currentPage).toInstance(currentPageAtom).inTransientScope();
        container.bind(DG.customPagination).toInstance(customPaginationAtom).inTransientScope();
        container.bind(DG.dynamicPage).toInstance(dynamicPageAtom).inTransientScope();
        container.bind(DG.dynamicPageSize).toInstance(dynamicPageSizeAtom).inTransientScope();
        container.bind(DG.dynamicPagination).toInstance(DynamicPaginationFeature).inSingletonScope();
        container.bind(DG.pageSize).toInstance(pageSizeAtom).inTransientScope();
        container.bind(DG.pageControl).toInstance(PageControlService).inSingletonScope();
        container.bind(DG.paginationVM).toInstance(PaginationViewModel).inSingletonScope();
        container.bind(DG.setPageAction).toInstance(createSetPageAction).inSingletonScope();
        container.bind(DG.setPageSizeAction).toInstance(createSetPageSizeAction).inSingletonScope();
    },
    init(container, { props }) {
        const config = paginationConfig(props);
        container.bind(DG.paginationConfig).toConstant(config);
        container.bind(CORE.initPageSize).toConstant(config.constPageSize);
    },
    postInit(container) {
        const config = container.get(DG.paginationConfig);
        const query = container.get(DG.query);
        query.requestTotalCount(config.requestTotalCount);
        query.setBaseLimit(config.constPageSize);
        container.get(DG.dynamicPagination); // Enable dynamic pagination feature
    }
};

const _07_selectionBindings: BindingGroup = {
    inject() {
        injected(SelectionGate, CORE.mainGate);
        injected(createSelectionHelper, CORE.setupService, DG.selectionGate, CORE.config.optional);
        injected(gridStyleAtom, CORE.columnsStore, CORE.config, DG.gridSizeStore);
        injected(rowClassProvider, CORE.mainGate);
        injected(
            SelectionCounterViewModel,
            CORE.selection.selectedCount,
            CORE.selection.selectedCounterTextsStore,
            DG.selectionCounterCfg.optional
        );
    },
    define(container: Container) {
        container.bind(DG.selectionGate).toInstance(SelectionGate).inTransientScope();
        container.bind(DG.selectionHelper).toInstance(createSelectionHelper).inSingletonScope();
        container.bind(DG.gridColumnsStyle).toInstance(gridStyleAtom).inTransientScope();
        container.bind(DG.rowClass).toInstance(rowClassProvider).inTransientScope();
        container.bind(DG.selectionCounterVM).toInstance(SelectionCounterViewModel).inSingletonScope();
    },
    init(container, { config, props }) {
        container.bind(DG.selectionType).toConstant(config.selectionType);
        container.bind(DG.selectionCounterCfg).toConstant({ position: props.selectionCounterPosition });
    },
    postInit(container, { config }) {
        // Create selection helper if selection is enabled
        if (config.selectionEnabled) {
            container.get(DG.selectionHelper);
        } else {
            // Override selection helper with null to disable selection features
            container.bind(DG.selectionHelper).toConstant(null);
        }
    }
};

const _08_rowInteractionBindings: BindingGroup = {
    inject() {
        injected(SelectActionsProvider, DG.selectionType, DG.selectionHelper);
        injected(createFocusController, CORE.setupService, DG.virtualLayout);
        injected(creteCheckboxEventsController, CORE.config, DG.selectActions, DG.focusService, DG.pageSize);
        injected(layoutAtom, CORE.atoms.itemCount, CORE.atoms.columnCount, DG.pageSize);
        injected(createClickActionHelper, CORE.setupService, CORE.mainGate);
        injected(
            createCellEventsController,
            CORE.config,
            DG.selectActions,
            DG.focusService,
            DG.clickActionHelper,
            DG.pageSize
        );
    },
    define(container: Container) {
        container.bind(DG.selectActions).toInstance(SelectActionsProvider).inSingletonScope();
        container.bind(DG.focusService).toInstance(createFocusController).inSingletonScope();
        container.bind(DG.checkboxEventsHandler).toInstance(creteCheckboxEventsController).inSingletonScope();
        container.bind(DG.virtualLayout).toInstance(layoutAtom).inTransientScope();
        container.bind(DG.clickActionHelper).toInstance(createClickActionHelper).inSingletonScope();
        container.bind(DG.cellEventsHandler).toInstance(createCellEventsController).inSingletonScope();
    }
};

const _09_selectAllBindings: BindingGroup = {
    init(container, { selectAllModule }) {
        container.bind(SA_TOKENS.progressService).toConstant(selectAllModule.get(SA_TOKENS.progressService));
        container.bind(SA_TOKENS.selectionDialogVM).toConstant(selectAllModule.get(SA_TOKENS.selectionDialogVM));
        container.bind(SA_TOKENS.selectAllBarVM).toConstant(selectAllModule.get(SA_TOKENS.selectAllBarVM));
    }
};

const groups = [
    _01_coreBindings,
    _02_filterBindings,
    _03_loaderBindings,
    _04_emptyStateBindings,
    _05_personalizationBindings,
    _06_paginationBindings,
    _07_selectionBindings,
    _08_rowInteractionBindings,
    _09_selectAllBindings
];

// Inject tokens from groups
for (const grp of groups) {
    grp.inject?.();
}

export class DatagridContainer extends Container {
    id = `DatagridContainer@${generateUUID()}`;

    constructor(root: Container) {
        super();
        this.extend(root);

        for (const grp of groups) {
            grp.define?.(this);
        }
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

        // Bind refresh interval
        // Run binding groups init phase
        for (const grp of groups) {
            grp.init?.(this, { props, config, mainGate, exportProgressService, selectAllModule });
        }

        // Run binding groups post init phase
        for (const grp of groups) {
            grp.postInit?.(this, { props, config, mainGate, exportProgressService, selectAllModule });
        }

        // Make sure essential services are created upfront
        this.get(DG.paramsService); // Enable sort & filtering
        this.get(DG.gridSizeStore);

        return this;
    }
}
