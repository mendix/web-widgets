import { token } from "brandi";
import { createInjectionHooks } from "brandi-react";
import type { ListValue } from "mendix";
import type { FilterAPI } from "@mendix/widget-plugin-filtering/context";
import type {
    CombinedFilter,
    CombinedFilterConfig
} from "@mendix/widget-plugin-filtering/stores/generic/CombinedFilter";
import type { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import type { QueryService } from "@mendix/widget-plugin-grid/main";
import type { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import type { DatasourceParamsController } from "./DatasourceParamsController";
import type { DerivedLoaderController, DerivedLoaderControllerConfig } from "./DerivedLoaderController";
import type { RowClassProvider, RowKeyProvider } from "./rows.model";

export const DATASOURCE_TOKENS = {
    combinedFilter: token<CombinedFilter>("CombinedFilter"),
    combinedFilterConfig: token<CombinedFilterConfig>("CombinedFilterKey"),

    filterAPI: token<FilterAPI>("FilterAPI"),
    filterHost: token<CustomFilterHost>("FilterHost"),

    loaderConfig: token<DerivedLoaderControllerConfig>("DatagridLoaderConfig"),
    loaderVM: token<DerivedLoaderController>("DatagridLoaderViewModel"),

    parentChannelName: token<string>("parentChannelName"),
    refreshInterval: token<number>("refreshInterval"),

    paramsService: token<DatasourceParamsController>("DatagridParamsService"),

    query: token<QueryService>("QueryService"),
    queryGate: token<DerivedPropsGate<{ datasource: ListValue }>>("@gate:GateForQueryService"),

    rowClass: token<RowClassProvider>("@store:RowClassProvider"),
    rowKey: token<RowKeyProvider>("@store:RowKeyProvider")
};

export const [useDatagridFilterAPI] = createInjectionHooks(DATASOURCE_TOKENS.filterAPI);
export const [useLoaderViewModel] = createInjectionHooks(DATASOURCE_TOKENS.loaderVM);
export const [useRowClass] = createInjectionHooks(DATASOURCE_TOKENS.rowClass);
export const [useRowKey] = createInjectionHooks(DATASOURCE_TOKENS.rowKey);
