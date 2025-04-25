import { StaticSelectFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/StaticSelectFilterStore";

export interface EnumFilterAPI {
    filterStore: StaticSelectFilterStore;
    parentChannelName?: string;
}
