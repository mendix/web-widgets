import { ListValue } from "mendix";
import { ReactNode } from "react";
import { ThreeStateCheckBoxEnum } from "@mendix/widget-plugin-component-kit/ThreeStateCheckBox";

export type Status = "unavailable" | "loading" | "available";
export type CaptionPlacement = "label" | "options";
export type SelectionType = "single" | "multi";
export type Selector = SingleSelector | MultiSelector;
export type SortOrder = "asc" | "desc";

export interface CaptionsProvider {
    get(id: string | null): string;
    render(id: string | null, placement: CaptionPlacement, htmlFor?: string): ReactNode;
    emptyCaption: string;
}

/**
 * The options of one selector: ids in source order, narrowed by the search term either here
 * (client-side) or by the datasource (lazy loading).
 */
export interface OptionsProvider {
    status: Status;
    searchTerm: string;
    sortOrder?: SortOrder;
    datasourceFilter?: ListValue["filter"];
    /** Lazy loading: another page can be requested. */
    hasMore: boolean;
    /** Lazy loading: a page is on its way. */
    isLoading: boolean;

    getAll(): string[];
    setSearchTerm(term: string): void;
    loadMore(): void;
}

/**
 * The model seam the Core derives from: one per data source family and selection mode, derived
 * from the props gate and the static config. Writes go to the Mendix value and come back as props.
 */
interface SelectorBase<T, V> {
    type: T;
    status: Status;
    readOnly: boolean;
    validation?: string;
    clearable: boolean;
    currentId: V | null;
    setValue(value: V | null): void;
    options: OptionsProvider;
    caption: CaptionsProvider;
}

export interface SingleSelector extends SelectorBase<"single", string> {}
export interface MultiSelector extends SelectorBase<"multi", string[]> {
    /** The options the menu lists: row-click selection hides the selected ones. */
    getOptions(): string[];
    isOptionsSelected(): ThreeStateCheckBoxEnum;
}
