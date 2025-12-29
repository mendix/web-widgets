/** Tokens to resolve dependencies from the container. */

import { FilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CombinedFilter, CombinedFilterConfig } from "@mendix/widget-plugin-filtering/stores/generic/CombinedFilter";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { QueryService } from "@mendix/widget-plugin-grid/main";
import { DerivedPropsGate, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { SortInstruction } from "@mendix/widget-plugin-sorting/types/store";
import { token } from "brandi";
import { ListValue } from "mendix";
import { GalleryRootViewModel } from "../features/base/GalleryRoot.viewModel";
import { GalleryGateProps } from "../typings/GalleryGateProps";
import { GalleryConfig } from "./configs/Gallery.config";
import { QueryParamsService } from "./services/QueryParams.service";

const label = (name: string): string => `Gallery/${name}`;

/** Core tokens shared across containers through root container. */
export const CORE_TOKENS = {
    mainGate: token<DerivedPropsGate<GalleryGateProps>>(label("@gate:mainGate")),
    setupService: token<SetupComponentHost>(label("@service:setupService")),
    config: token<GalleryConfig>(label("@config:galleryConfig"))
};

export const GY_TOKENS = {
    // datasource
    query: token<QueryService>(label("@service:query")),
    queryGate: token<DerivedPropsGate<{ datasource: ListValue }>>(label("@gate:queryGate")),
    refreshInterval: token<number>(label("@const:refreshInterval")),
    queryParams: token<QueryParamsService>(label("@service:queryParams")),

    // filtering
    combinedFilter: token<CombinedFilter>(label("@service:combinedFilter")),
    combinedFilterConfig: token<CombinedFilterConfig>(label("@config:combinedFilterConfig")),
    filterAPI: token<FilterAPI>(label("@service:filterAPI")),
    filterHost: token<CustomFilterHost>(label("@service:filterHost")),
    parentChannelName: token<string>(label("@const:parentChannelName")),

    // sorting
    sortHost: token<{ sortOrder: SortInstruction[] | undefined }>(label("@service:sortHost")),
    sortHostConfig: token<{ initSort: SortInstruction[] }>(label("@config:sortHostConfig")),

    // gallery root
    galleryRootVM: token<GalleryRootViewModel>(label("@viewModel:galleryRootVM"))
};
