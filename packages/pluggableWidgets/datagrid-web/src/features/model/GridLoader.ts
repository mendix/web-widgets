import { ListValue } from "mendix";
import { PaginationEnum } from "../../../typings/DatagridProps";
import { Column } from "../../helpers/Column";
import { InitParams } from "../../typings/GridModel";
import { GridSettings } from "../../typings/GridSettings";
import { SettingsClient } from "../storage/base";
import { paramsFromColumns, paramsFromSettings, sortToInst } from "./utils";

type Settings = GridSettings | undefined;
type ReadyState = { status: "ready"; initParams: InitParams };
type PendingState = { status: "pending" };
export type State = PendingState | ReadyState;

export class GridLoader {
    private state: State = this.pending();
    private initialized = false;

    getInitState(
        datasource: ListValue,
        paginationType: PaginationEnum,
        pageSize: number,
        columns: Column[],
        settingsClient: SettingsClient
    ): State {
        if (this.state.status === "ready") {
            return this.state;
        }

        if (!this.initialized) {
            this.setInitParams(datasource, columns, paginationType, pageSize);
            this.initialized = true;
        }

        if (
            settingsClient.status === "loading" ||
            datasource.status === "loading" ||
            columns.some(column => column.status === "loading")
        ) {
            return this.pending();
        }

        let datasourceChanged = false;
        let settings: Settings;
        if (settingsClient.status === "available") {
            settings = settingsClient.settings.load();
            if (settings) {
                this.setViewState(datasource, settings, columns);
                datasource.reload();
                datasourceChanged = true;
            }
        }

        this.state = this.ready(datasource, columns, settings);

        return datasourceChanged ? this.pending() : this.state;
    }

    private setInitParams(
        datasource: ListValue,
        columns: Column[],
        paginationType: PaginationEnum,
        pageSize: number
    ): void {
        if (paginationType === "buttons") {
            datasource.requestTotalCount(true);
        }

        // Set initial limit
        datasource.setLimit(pageSize);

        // Prevent multiple requests options source
        columns.forEach(col => col.setInitParams());
    }

    private setViewState(datasource: ListValue, settings: GridSettings, columns: Column[]): void {
        if (settings.sortOrder.length > 0) {
            datasource.setSortOrder(sortToInst(settings.sortOrder, columns));
        }
    }

    private ready(datasource: ListValue, columns: Column[], settings: Settings): ReadyState {
        return {
            status: "ready",
            initParams: settings ? paramsFromSettings(settings, datasource) : paramsFromColumns(columns, datasource)
        };
    }

    private pending(): PendingState {
        return { status: "pending" };
    }
}
