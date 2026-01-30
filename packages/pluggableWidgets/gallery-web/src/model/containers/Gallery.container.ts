import { WidgetFilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CombinedFilter } from "@mendix/widget-plugin-filtering/stores/generic/CombinedFilter";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import {
    createClickActionHelper,
    createFocusController,
    createSelectionHelper,
    DatasourceService,
    SelectActionsProvider
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
import { SortStoreHost } from "@mendix/widget-plugin-sorting/stores/SortStoreHost";
import { Container, injected } from "brandi";
import { createItemEventsVMAtom } from "../../features/item-interaction/ItemEvents.viewModel";
import { GalleryGateProps } from "../../typings/GalleryGateProps";
import { EmptyPlaceholderViewModel } from "../../view-models/EmptyPlaceholder.viewModel";
import { GalleryItemViewModel } from "../../view-models/GalleryItem.viewModel";
import { GalleryRootViewModel } from "../../view-models/GalleryRoot.viewModel";
import { GalleryConfig } from "../configs/Gallery.config";
import { galleryPaginationConfig } from "../configs/GalleryPagination.config";
import { itemsAtom } from "../models/items.model";
import { layoutAtom, numberOfColumnsAtom } from "../models/layout.model";
import { LayoutService } from "../services/Layout.service";
import { LoaderService } from "../services/Loader.service";
import { QueryParamsService } from "../services/QueryParams.service";
import { SelectionGate } from "../services/SelectionGate.service";
import { TextsService } from "../services/Texts.service";
import { CORE_TOKENS as CORE, GY_TOKENS as GY } from "../tokens";

interface InitDependencies {
    props: GalleryGateProps;
    mainGate: DerivedPropsGate<GalleryGateProps>;
    config: GalleryConfig;
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
        injected(itemsAtom, CORE.mainGate);
        injected(TextsService, CORE.mainGate);
    },
    init(container, { mainGate, config }) {
        container.bind(CORE.mainGate).toConstant(mainGate);
        container.bind(CORE.config).toConstant(config);
        container.bind(CORE.items).toInstance(itemsAtom).inTransientScope();
        container.bind(CORE.texts).toInstance(TextsService).inTransientScope();
    }
};

const _02_queryBindings: BindingGroup = {
    inject() {
        injected(DatasourceService, CORE.setupService, GY.queryGate, GY.refreshInterval.optional);
        injected(QueryParamsService, CORE.setupService, GY.query, GY.combinedFilter, GY.sortHost);
    },
    define(container: Container) {
        container.bind(GY.query).toInstance(DatasourceService).inSingletonScope();
        container.bind(GY.queryParams).toInstance(QueryParamsService).inSingletonScope();
    },
    init(container, { mainGate }) {
        container.bind(GY.queryGate).toConstant(mainGate);
    },
    postInit(container) {
        // Create param service instance.
        container.get(GY.queryParams);
    }
};

const _03_filterBindings: BindingGroup = {
    inject() {
        injected(CombinedFilter, CORE.setupService, GY.combinedFilterConfig);
        injected(WidgetFilterAPI, GY.parentChannelName, GY.filterHost);
    },
    define(container: Container) {
        container.bind(GY.filterAPI).toInstance(WidgetFilterAPI).inSingletonScope();
        container.bind(GY.filterHost).toInstance(CustomFilterHost).inSingletonScope();
        container.bind(GY.combinedFilter).toInstance(CombinedFilter).inSingletonScope();
    },
    init(container, { config }) {
        container.bind(GY.parentChannelName).toConstant(config.filtersChannelName);
        container.bind(GY.combinedFilterConfig).toConstant({
            stableKey: config.name,
            inputs: [container.get(GY.filterHost)]
        });
    },
    postInit(container, { props }) {
        // Hydrate filters from props
        container.get(GY.combinedFilter).hydrate(props.datasource.filter);
    }
};

const _04_sortBindings: BindingGroup = {
    inject() {
        injected(SortStoreHost, GY.sortHostConfig.optional);
    },
    define(container) {
        container.bind(GY.sortHost).toInstance(SortStoreHost).inSingletonScope();
    },
    init(container, { props }) {
        container.bind(GY.sortHostConfig).toConstant({ initSort: props.datasource.sortOrder });
        container.bind(GY.sortAPI).toConstant({
            version: 1,
            host: container.get(GY.sortHost) as SortStoreHost
        });
    }
};

const _05_viewBindings: BindingGroup = {
    inject() {
        injected(GalleryRootViewModel, CORE.mainGate);
        injected(GalleryItemViewModel, CORE.mainGate);
        injected(EmptyPlaceholderViewModel, CORE.mainGate, CORE.data.itemCount);
    },
    define(container) {
        container.bind(GY.galleryRootVM).toInstance(GalleryRootViewModel).inTransientScope();
        container.bind(GY.galleryItemVM).toInstance(GalleryItemViewModel).inTransientScope();
        container.bind(GY.emptyPlaceholderVM).toInstance(EmptyPlaceholderViewModel).inTransientScope();
    }
};

const _06_loaderBindings: BindingGroup = {
    inject() {
        injected(LoaderService, GY.query, GY.loaderConfig);
    },
    define(container: Container) {
        container.bind(GY.loader).toInstance(LoaderService).inSingletonScope();
    },
    init(container, { props }) {
        container.bind(GY.loaderConfig).toConstant({
            refreshIndicator: props.refreshIndicator,
            showSilentRefresh: props.refreshInterval > 1
        });
    },
    postInit(container) {
        container.get(GY.loader);
    }
};

const _07_selectionBindings: BindingGroup = {
    inject() {
        injected(
            SelectionCounterViewModel,
            CORE.selection.selectedCount,
            CORE.selection.selectedCounterTextsStore,
            GY.selectionCounterConfig.optional
        );
        injected(SelectionGate, CORE.mainGate);
        injected(createSelectionHelper, CORE.setupService, GY.selectionGate, CORE.config.optional);
        injected(SelectActionsProvider, GY.selectionType, GY.selectionHelper);
    },
    define(container: Container) {
        container.bind(GY.selectionCounterVM).toInstance(SelectionCounterViewModel).inSingletonScope();
        container.bind(GY.selectionGate).toInstance(SelectionGate).inTransientScope();
        container.bind(GY.selectActions).toInstance(SelectActionsProvider).inSingletonScope();
        container.bind(GY.selectionHelper).toInstance(createSelectionHelper).inSingletonScope();
    },
    init(container, { props, config }) {
        container.bind(GY.selectionCounterConfig).toConstant({ position: props.selectionCountPosition });
        container.bind(GY.selectionType).toConstant(config.selectionType);
    },
    postInit(container, { config }) {
        // Create selection helper if selection is enabled
        if (config.selectionEnabled) {
            container.get(GY.selectionHelper);
        } else {
            container.bind(GY.selectionHelper).toConstant(null);
        }
    }
};

const _08_paginationBindings: BindingGroup = {
    inject() {
        injected(createSetPageAction, GY.query, GY.paging.paginationConfig, GY.paging.currentPage, GY.paging.pageSize);
        injected(
            createSetPageSizeAction,
            GY.query,
            GY.paging.paginationConfig,
            GY.paging.currentPage,
            CORE.pageSizeStore,
            GY.paging.setPageAction
        );
        injected(currentPageAtom, GY.query, GY.paging.pageSize, GY.paging.paginationConfig);
        injected(dynamicPageAtom, CORE.mainGate, GY.paging.paginationConfig);
        injected(dynamicPageSizeAtom, CORE.mainGate);
        injected(PageControlService, CORE.mainGate, GY.paging.setPageSizeAction, GY.paging.setPageAction);
        injected(pageSizeAtom, CORE.pageSizeStore);
        injected(
            PaginationViewModel,
            GY.paging.paginationConfig,
            GY.query,
            GY.paging.currentPage,
            GY.paging.pageSize,
            GY.paging.setPageAction
        );
        injected(
            DynamicPaginationFeature,
            CORE.setupService,
            GY.paging.paginationConfig,
            GY.paging.dynamicPage,
            GY.paging.dynamicPageSize,
            CORE.data.totalCount,
            GY.paging.pageControl
        );
        injected(customPaginationAtom, CORE.mainGate);
    },
    define(container: Container) {
        container.bind(GY.paging.currentPage).toInstance(currentPageAtom).inTransientScope();
        container.bind(GY.paging.customPagination).toInstance(customPaginationAtom).inTransientScope();
        container.bind(GY.paging.dynamicPage).toInstance(dynamicPageAtom).inTransientScope();
        container.bind(GY.paging.dynamicPageSize).toInstance(dynamicPageSizeAtom).inTransientScope();
        container.bind(GY.paging.dynamicPagination).toInstance(DynamicPaginationFeature).inSingletonScope();
        container.bind(GY.paging.pageControl).toInstance(PageControlService).inSingletonScope();
        container.bind(GY.paging.pageSize).toInstance(pageSizeAtom).inTransientScope();
        container.bind(GY.paging.paginationVM).toInstance(PaginationViewModel).inTransientScope();
        container.bind(GY.paging.setPageAction).toInstance(createSetPageAction).inSingletonScope();
        container.bind(GY.paging.setPageSizeAction).toInstance(createSetPageSizeAction).inSingletonScope();
    },
    init(container, { props }) {
        const config = galleryPaginationConfig(props);
        container.bind(GY.paging.paginationConfig).toConstant(config);
        container.bind(CORE.initPageSize).toConstant(config.constPageSize);
    },
    postInit(container) {
        const config = container.get(GY.paging.paginationConfig);
        const query = container.get(GY.query);
        query.requestTotalCount(config.requestTotalCount);
        query.setBaseLimit(config.constPageSize);
        container.get(GY.paging.dynamicPagination); // Enable dynamic pagination feature
    }
};

const _09_itemEventsBindings: BindingGroup = {
    inject() {
        injected(createClickActionHelper, CORE.setupService, CORE.mainGate);
        injected(createFocusController, CORE.setupService, GY.virtualLayout);
        injected(LayoutService, CORE.setupService, CORE.config, CORE.data.itemCount);
        injected(layoutAtom, GY.layoutService, GY.paging.pageSize);
        injected(numberOfColumnsAtom, GY.layoutService);
        injected(
            createItemEventsVMAtom,
            CORE.config,
            GY.selectActions,
            GY.clickActionHelper,
            GY.keyNavFocusService,
            GY.numberOfColumns
        );
    },
    define(container: Container) {
        container.bind(GY.clickActionHelper).toInstance(createClickActionHelper).inSingletonScope();
        container.bind(GY.virtualLayout).toInstance(layoutAtom).inTransientScope();
        container.bind(GY.keyNavFocusService).toInstance(createFocusController).inSingletonScope();
        container.bind(GY.layoutService).toInstance(LayoutService).inSingletonScope();
        container.bind(GY.numberOfColumns).toInstance(numberOfColumnsAtom).inTransientScope();
        container.bind(GY.itemEventsVM).toInstance(createItemEventsVMAtom).inTransientScope();
    },
    init(container, { mainGate }) {
        container.bind(CORE.mainGate).toConstant(mainGate);
    }
};

const groups = [
    _01_coreBindings,
    _02_queryBindings,
    _03_filterBindings,
    _04_sortBindings,
    _05_viewBindings,
    _06_loaderBindings,
    _07_selectionBindings,
    _08_paginationBindings,
    _09_itemEventsBindings
];

// Inject tokens from groups
for (const grp of groups) {
    grp.inject?.();
}

export class GalleryContainer extends Container {
    id = `GalleryContainer@${generateUUID()}`;

    constructor(root: Container) {
        super();
        this.extend(root);

        for (const grp of groups) {
            grp.define?.(this);
        }
    }

    init(dependencies: {
        props: GalleryGateProps;
        mainGate: DerivedPropsGate<GalleryGateProps>;
        config: GalleryConfig;
    }): GalleryContainer {
        for (const grp of groups) {
            grp.init?.(this, dependencies);
        }

        for (const grp of groups) {
            grp.postInit?.(this, dependencies);
        }

        return this;
    }
}
