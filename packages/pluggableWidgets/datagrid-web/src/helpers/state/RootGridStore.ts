import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { FilterCondition } from "mendix/filters";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { ProgressStore } from "../../features/data-export/ProgressStore";
import { SortInstruction } from "../../typings/sorting";
import { StaticInfo } from "../../typings/static-info";
import { ColumnGroupStore } from "./ColumnGroupStore";
import { GridPersonalizationStore } from "./GridPersonalizationStore";
import { HeaderFiltersStore } from "./HeaderFiltersStore";
import { conjoin } from "@mendix/widget-plugin-filtering/condition-utils";

export class RootGridStore {
    columnsStore: ColumnGroupStore;
    headerFiltersStore: HeaderFiltersStore;
    settingsStore: GridPersonalizationStore;
    progressStore: ProgressStore;
    staticInfo: StaticInfo;

    constructor(props: DatagridContainerProps) {
        this.setInitParams(props);
        this.staticInfo = {
            name: props.name,
            filtersChannelName: `datagrid/${generateUUID()}`
        };
        this.columnsStore = new ColumnGroupStore(props, this.staticInfo);
        this.headerFiltersStore = new HeaderFiltersStore(props);
        this.settingsStore = new GridPersonalizationStore(props, this.columnsStore, this.headerFiltersStore);
        this.progressStore = new ProgressStore();
        console.debug(((window as any).rootStore = this));
    }

    setup(): void {
        this.headerFiltersStore.setup();
    }

    dispose(): void {
        this.headerFiltersStore.dispose();
        this.settingsStore.dispose();
    }

    private setInitParams(props: DatagridContainerProps): void {
        if (props.pagination === "buttons") {
            props.datasource.requestTotalCount(true);
        }

        // Set initial limit
        props.datasource.setLimit(props.pageSize);
    }

    updateProps(props: DatagridContainerProps): void {
        if (this.progressStore.exporting) {
            return;
        }
        this.columnsStore.updateProps(props);
        this.settingsStore.updateProps(props);
    }

    get isLoaded(): boolean {
        return this.columnsStore.loaded;
    }

    /**
     * This method should always "read" filters from columns.
     * Otherwise computed is suspended.
     */
    get filterConditions(): FilterCondition {
        return conjoin([conjoin(this.columnsStore.conditions), conjoin(this.headerFiltersStore.conditions)]);
    }

    get sortInstructions(): SortInstruction[] | undefined {
        return this.columnsStore.sortInstructions;
    }
}
