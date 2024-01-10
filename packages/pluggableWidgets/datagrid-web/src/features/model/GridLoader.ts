import { ListValue } from "mendix";
import { PaginationEnum } from "../../../typings/DatagridProps";
import { Column } from "../../helpers/Column";
import { GridSettings } from "../../typings/GridSettings";
import { SettingsClient } from "../storage/base";

type Settings = GridSettings | undefined;
type ReadyState = { status: "ready"; settings: Settings };
type PendingState = { status: "pending" };
export type State = PendingState | ReadyState;

export class GridLoader {
    private status: "pending" | "ready" = "pending";
    private initialized = false;
    private settings: Settings = undefined;

    getInitState(
        datasource: ListValue,
        paginationType: PaginationEnum,
        pageSize: number,
        columns: Column[],
        settingsClient: SettingsClient
    ): State {
        if (this.status === "ready") {
            return this.ready();
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
        if (settingsClient.status === "available") {
            this.settings = settingsClient.settings.load();
            this.setViewState(datasource, this.settings);
            datasource.reload();
            datasourceChanged = true;
        }

        this.status = "ready";

        return datasourceChanged ? this.pending() : this.ready();
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

    private setViewState(_: ListValue, __: Settings): void {
        console.log("Set view stat");
    }

    private ready(): ReadyState {
        return { status: "ready", settings: this.settings };
    }

    private pending(): PendingState {
        return { status: "pending" };
    }
}
