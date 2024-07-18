import { ColumnGroupStore } from "./ColumnGroupStore";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { HeaderFiltersStore } from "./HeaderFiltersStore";
import { FilterCondition } from "mendix/filters";
import { SortInstruction } from "../../typings/sorting";
import { GridPersonalizationStore } from "./GridPersonalizationStore";
import { ProgressStore } from "../../features/data-export/ProgressStore";

export class RootGridStore {
    columnsStore: ColumnGroupStore;
    headerFiltersStore: HeaderFiltersStore;
    settingsStore: GridPersonalizationStore;
    progressStore: ProgressStore;

    constructor(props: DatagridContainerProps) {
        this.setInitParams(props);
        this.columnsStore = new ColumnGroupStore(props);
        this.headerFiltersStore = new HeaderFiltersStore(props);
        this.settingsStore = new GridPersonalizationStore(props, this.columnsStore);
        this.progressStore = new ProgressStore();
    }

    dispose(): void {
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
    get filterConditions(): FilterCondition[] {
        return this.columnsStore.filterConditions2
            .filter((filter): filter is FilterCondition => filter !== undefined)
            .concat(this.headerFiltersStore.filterConditions);
    }

    get sortInstructions(): SortInstruction[] | undefined {
        return this.columnsStore.sortInstructions;
    }
}
