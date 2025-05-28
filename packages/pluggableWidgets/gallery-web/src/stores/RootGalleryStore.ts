import { compactArray, fromCompactArray } from "@mendix/widget-plugin-filtering/condition-utils";
import { HeaderFiltersStore } from "@mendix/widget-plugin-filtering/stores/generic/HeaderFiltersStore";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { SortAPIProvider } from "@mendix/widget-plugin-sorting/providers/SortAPIProvider";
import { ListValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { GalleryContainerProps } from "../../typings/GalleryProps";

type SortInstruction = ListValue["sortOrder"] extends Array<infer T> ? T : never;

interface StaticInfo {
    name: string;
    filtersChannelName: string;
}

export class RootGalleryStore {
    headerFiltersStore: HeaderFiltersStore;
    sortProvider: SortAPIProvider;
    staticInfo: StaticInfo;

    constructor(props: GalleryContainerProps) {
        this.setInitParams(props);
        this.staticInfo = {
            name: props.name,
            filtersChannelName: `datagrid/${generateUUID()}`
        };

        const headerViewState = this.getDsViewState(props);
        this.headerFiltersStore = new HeaderFiltersStore(props, this.staticInfo, headerViewState);
        this.sortProvider = new SortAPIProvider(props);
    }

    get conditions(): FilterCondition {
        return compactArray(this.headerFiltersStore.conditions);
    }

    get sortOrder(): SortInstruction[] {
        return this.sortProvider.sortOrder;
    }

    setup(): (() => void) | void {
        return this.headerFiltersStore.setup();
    }

    updateProps(_: GalleryContainerProps): void {}

    private setInitParams(props: GalleryContainerProps): void {
        if (props.pagination === "buttons") {
            props.datasource.requestTotalCount(true);
        }

        // Set initial limit
        props.datasource.setLimit(props.pageSize);
    }

    // Mirror operation from "condition";
    private getDsViewState({ datasource }: GalleryContainerProps): Array<FilterCondition | undefined> {
        if (!datasource.filter) {
            return [];
        }

        return fromCompactArray(datasource.filter);
    }
}
