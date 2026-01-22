import { WidgetFilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CombinedFilter } from "@mendix/widget-plugin-filtering/stores/generic/CombinedFilter";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { createSelectionHelper, DatasourceService, SelectActionsProvider } from "@mendix/widget-plugin-grid/main";
import { SelectionCounterViewModel } from "@mendix/widget-plugin-grid/selection-counter/SelectionCounter.viewModel-atoms";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { SortStoreHost } from "@mendix/widget-plugin-sorting/stores/SortStoreHost";
import { Container, injected } from "brandi";
import { GalleryGateProps } from "../../typings/GalleryGateProps";
import { GalleryRootViewModel } from "../../view-models/GalleryRoot.viewModel";
import { GalleryConfig } from "../configs/Gallery.config";
import { LoaderService } from "../services/Loader.service";
import { QueryParamsService } from "../services/QueryParams.service";
import { SelectionGate } from "../services/SelectionGate.service";
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
    init(container, { mainGate, config }) {
        container.bind(CORE.mainGate).toConstant(mainGate);
        container.bind(CORE.config).toConstant(config);
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
    }
};

const _05_viewBindings: BindingGroup = {
    inject() {
        injected(GalleryRootViewModel, CORE.mainGate);
    },
    define(container) {
        container.bind(GY.galleryRootVM).toInstance(GalleryRootViewModel).inSingletonScope();
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

const groups = [
    _01_coreBindings,
    _02_queryBindings,
    _03_filterBindings,
    _04_sortBindings,
    _05_viewBindings,
    _06_loaderBindings,
    _07_selectionBindings
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
