import { RefFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/RefFilterStore";
import { StaticSelectFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/StaticSelectFilterStore";

export interface EnumFilterAPI {
    filterStore: StaticSelectFilterStore;
    parentChannelName?: string;
}

export interface RefFilterAPI {
    filterStore: RefFilterStore;
    parentChannelName?: string;
}
