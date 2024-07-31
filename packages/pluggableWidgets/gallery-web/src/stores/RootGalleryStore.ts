import { conjoin, disjoin } from "@mendix/widget-plugin-filtering/condition-utils";
import { HeaderFiltersStore } from "@mendix/widget-plugin-filtering/stores/HeaderFiltersStore";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { ListValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { GalleryContainerProps } from "../../typings/GalleryProps";
import { SortAPIProvider } from "@mendix/widget-plugin-sorting/providers/SortAPIProvider";

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
        this.headerFiltersStore = new HeaderFiltersStore(props, headerViewState);
        this.sortProvider = new SortAPIProvider(props);
    }

    get conditions(): FilterCondition {
        return conjoin(this.headerFiltersStore.conditions);
    }

    get sortOrder(): SortInstruction[] {
        return this.sortProvider.sortOrder;
    }

    setup(): (() => void) | void {
        return this.headerFiltersStore.setup();
    }

    updateProps(props: GalleryContainerProps): void {
        this.headerFiltersStore.updateProps(props);
    }

    private setInitParams(props: GalleryContainerProps): void {
        if (props.pagination === "buttons") {
            props.datasource.requestTotalCount(true);
        }

        // Set initial limit
        props.datasource.setLimit(props.pageSize);
    }

    // Mirror operation from "condition";
    private getDsViewState({ datasource }: GalleryContainerProps): Array<FilterCondition | undefined> | null {
        if (datasource.filter) {
            try {
                return disjoin(datasource.filter);
            } catch {
                //
            }
        }

        return null;
    }
}
