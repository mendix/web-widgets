import { WidgetFilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CombinedFilter } from "@mendix/widget-plugin-filtering/stores/generic/CombinedFilter";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { DatasourceService } from "@mendix/widget-plugin-grid/main";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { SortStoreHost } from "@mendix/widget-plugin-sorting/stores/SortStoreHost";
import { Container, injected } from "brandi";
import { GalleryRootViewModel } from "../../features/base/GalleryRoot.viewModel";
import { GalleryGateProps } from "../../typings/GalleryGateProps";
import { GalleryConfig } from "../configs/Gallery.config";
import { QueryParamsService } from "../services/QueryParams.service";
import { CORE_TOKENS as CORE, GY_TOKENS as GY } from "../tokens";

interface InitDependencies {
    props: GalleryGateProps;
    mainGate: DerivedPropsGate<GalleryGateProps>;
    config: GalleryConfig;
}

/** Just little utility object to group related bindings */
interface BindingGroup {
    /** Runs during container constructor. */
    define?(container: Container): void;
    /** Runs on container init with deps. */
    init?(container: Container, deps: InitDependencies): void;
    /** This method runs after init phase. */
    postInit?(container: Container): void;
    /** This method runs only once. Should be used to inject dependencies. */
    inject?(): void;
}

const coreBindings: BindingGroup = {
    init(container, { mainGate, config }) {
        container.bind(CORE.mainGate).toConstant(mainGate);
        container.bind(CORE.config).toConstant(config);
    }
};

const queryBindings: BindingGroup = {
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
    },
    inject() {
        injected(DatasourceService, CORE.setupService, GY.queryGate, GY.refreshInterval.optional);
        injected(QueryParamsService, CORE.setupService, GY.query, GY.combinedFilter, GY.sortHost);
    }
};

const filterBindings: BindingGroup = {
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
    inject() {
        injected(CombinedFilter, CORE.setupService, GY.combinedFilterConfig);
        injected(WidgetFilterAPI, GY.parentChannelName, GY.filterHost);
    }
};

const sortBindings: BindingGroup = {
    define(container) {
        container.bind(GY.sortHost).toInstance(SortStoreHost).inSingletonScope();
    },
    init(container, { props }) {
        container.bind(GY.sortHostConfig).toConstant({ initSort: props.datasource.sortOrder });
    },
    inject() {
        injected(SortStoreHost, GY.sortHostConfig.optional);
    }
};

const viewBindings: BindingGroup = {
    define(container) {
        container.bind(GY.galleryRootVM).toInstance(GalleryRootViewModel).inSingletonScope();
    },
    inject() {
        injected(GalleryRootViewModel, CORE.mainGate);
    }
};

const groups = [coreBindings, queryBindings, filterBindings, sortBindings, viewBindings];

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

        this.postInit();

        return this;
    }

    private postInit(): GalleryContainer {
        for (const grp of groups) {
            grp.postInit?.(this);
        }

        return this;
    }
}
