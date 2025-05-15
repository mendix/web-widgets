import { RefFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/RefFilterStore";
import { StaticSelectFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/StaticSelectFilterStore";

export interface EnumFilterProps {
    filterStore: StaticSelectFilterStore;
    parentChannelName?: string;
}

export interface RefFilterProps {
    filterStore: RefFilterStore;
    parentChannelName?: string;
}
