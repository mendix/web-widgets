import { EnumFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/EnumFilterStore";
import { RefFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/RefFilterStore";

export interface EnumFilterProps {
    filterStore: EnumFilterStore;
    parentChannelName?: string;
}

export interface RefFilterProps {
    filterStore: RefFilterStore;
    parentChannelName?: string;
}
