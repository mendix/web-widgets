import { compactArray, fromCompactArray, isAnd } from "@mendix/widget-plugin-filtering/condition-utils";
import { disposeFx } from "@mendix/widget-plugin-filtering/mobx-utils";
import { HeaderFiltersStore } from "@mendix/widget-plugin-filtering/stores/generic/HeaderFiltersStore";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { FilterCondition } from "mendix/filters";
import { and } from "mendix/filters/builders";
import { autorun } from "mobx";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { ProgressStore } from "../../features/data-export/ProgressStore";
import { SortInstruction } from "../../typings/sorting";
import { StaticInfo } from "../../typings/static-info";
import { ColumnGroupStore } from "./ColumnGroupStore";
import { GridPersonalizationStore } from "./GridPersonalizationStore";

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

        const [columnsViewState, headerViewState] = this.getDsViewState(props);
        this.columnsStore = new ColumnGroupStore(props, this.staticInfo, columnsViewState);
        this.headerFiltersStore = new HeaderFiltersStore(props, this.staticInfo, headerViewState);
        this.settingsStore = new GridPersonalizationStore(props, this.columnsStore, this.headerFiltersStore);
        this.progressStore = new ProgressStore();
        autorun(reaction => {
            reaction.trace();
            console.log("RootGridStore.isColumnsLoaded", this.isColumnsLoaded);
        });
    }

    get isColumnsLoaded(): boolean {
        return this.columnsStore.loaded;
    }

    /**
     * This method should always "read" filters from columns.
     * Otherwise computed is suspended.
     */
    get conditions(): FilterCondition {
        const columns = this.columnsStore.conditions;
        const header = this.headerFiltersStore.conditions;
        return and(compactArray(columns), compactArray(header));
    }

    get sortInstructions(): SortInstruction[] | undefined {
        return this.columnsStore.sortInstructions;
    }

    setup(): () => void {
        const [disposers, dispose] = disposeFx();
        disposers.push(this.columnsStore.setup());
        disposers.push(this.headerFiltersStore.setup() ?? (() => {}));

        return dispose;
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

    // Mirror operation from "condition";
    private getDsViewState({
        datasource
    }: DatagridContainerProps):
        | [columns: Array<FilterCondition | undefined>, header: Array<FilterCondition | undefined>] {
        if (!datasource.filter) {
            return [[], []];
        }
        if (!isAnd(datasource.filter)) {
            return [[], []];
        }
        if (datasource.filter.args.length !== 2) {
            return [[], []];
        }
        const [columns, header] = datasource.filter.args;
        return [fromCompactArray(columns), fromCompactArray(header)];
    }

    updateProps(props: DatagridContainerProps): void {
        if (this.progressStore.exporting) {
            return;
        }
        this.columnsStore.updateProps(props);
        this.settingsStore.updateProps(props);
    }
}
