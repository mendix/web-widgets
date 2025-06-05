import { RefFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/RefFilterStore";
import { EnumFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/StaticSelectFilterStore";

export interface EnumFilterProps {
    filterStore: EnumFilterStore;
    parentChannelName?: string;
}

export interface RefFilterProps {
    filterStore: RefFilterStore;
    parentChannelName?: string;
}
