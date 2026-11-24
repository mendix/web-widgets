import { Container, injected } from "brandi";
import { WidgetFilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CombinedFilter } from "@mendix/widget-plugin-filtering/stores/generic/CombinedFilter";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { DatasourceService } from "@mendix/widget-plugin-grid/main";
import { DatasourceParamsController } from "./DatasourceParamsController";
import { DerivedLoaderController } from "./DerivedLoaderController";
import { rowClassProvider, rowKeyProvider } from "./rows.model";
import { DATASOURCE_TOKENS as DATASOURCE } from "./tokens";
import { COLUMNS_TOKENS as COLUMNS } from "../columns/tokens";
import { BindingGroup } from "../core/binding-group";
import { CORE_TOKENS as CORE } from "../core/tokens";
import { DATA_EXPORT_TOKENS as DATA_EXPORT } from "../data-export/tokens";

export const datasourceBindings: BindingGroup = {
    inject() {
        injected(
            DatasourceParamsController,
            CORE.setupService,
            DATASOURCE.query,
            DATASOURCE.combinedFilter,
            COLUMNS.columnsStore
        );
        injected(DatasourceService, CORE.setupService, DATASOURCE.queryGate, DATASOURCE.refreshInterval.optional);
        injected(CombinedFilter, CORE.setupService, DATASOURCE.combinedFilterConfig);
        injected(WidgetFilterAPI, DATASOURCE.parentChannelName, DATASOURCE.filterHost);
        injected(
            DerivedLoaderController,
            DATASOURCE.query,
            DATA_EXPORT.exportProgressService,
            COLUMNS.columnsStore,
            DATASOURCE.loaderConfig
        );
        injected(rowClassProvider, CORE.mainGate);
        injected(rowKeyProvider, CORE.mainGate);
    },
    define(container: Container) {
        container.bind(DATASOURCE.query).toInstance(DatasourceService).inSingletonScope();
        container.bind(DATASOURCE.paramsService).toInstance(DatasourceParamsController).inSingletonScope();
        container.bind(DATASOURCE.filterAPI).toInstance(WidgetFilterAPI).inSingletonScope();
        container.bind(DATASOURCE.filterHost).toInstance(CustomFilterHost).inSingletonScope();
        container.bind(DATASOURCE.combinedFilter).toInstance(CombinedFilter).inSingletonScope();
        container.bind(DATASOURCE.loaderVM).toInstance(DerivedLoaderController).inSingletonScope();
        container.bind(DATASOURCE.rowClass).toInstance(rowClassProvider).inTransientScope();
        container.bind(DATASOURCE.rowKey).toInstance(rowKeyProvider).inTransientScope();
    },
    init(container, { props, mainGate, config }) {
        container.bind(DATASOURCE.queryGate).toConstant(mainGate);
        container.bind(DATASOURCE.refreshInterval).toConstant(config.refreshIntervalMs);
        container.bind(DATASOURCE.parentChannelName).toConstant(config.filtersChannelName);
        container.bind(DATASOURCE.combinedFilterConfig).toConstant({
            stableKey: props.name,
            inputs: [container.get(DATASOURCE.filterHost), container.get(COLUMNS.columnsStore)]
        });
        container.bind(DATASOURCE.loaderConfig).toConstant({
            showSilentRefresh: props.refreshInterval > 1,
            refreshIndicator: props.refreshIndicator
        });
    },
    postInit(container, { props }) {
        // Hydrate filters from props
        container.get(DATASOURCE.combinedFilter).hydrate(props.datasource.filter);
    }
};
