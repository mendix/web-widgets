import { ListValue } from "mendix";
import { Event, EventCallable, Store, sample } from "effector";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { GridModel, InitParams, Status } from "./base";
import { Column } from "../../helpers/Column";
import { StorageDone } from "../storage/base";
import { paramsFromColumns, paramsFromSettings } from "./utils";

export function setup(
    $status: Store<Status>,
    grid: GridModel,
    propsUpdated: Event<DatagridContainerProps>,
    initParamsSent: EventCallable<InitParams>
): void {
    const initParamsUpdate = sample({
        clock: propsUpdated,
        source: {
            status: $status,
            columns: grid.columns,
            storage: grid.storage
        },
        fn: ({ status, columns, storage }, { datasource }) => {
            if (status === "ready") {
                return "skip";
            }

            if (
                datasource.status !== "available" ||
                columns.some(c => c.status === "loading") ||
                storage.status === "pending"
            ) {
                return "pending";
            }

            return createInitParams({
                columns,
                ds: datasource,
                storage
            });
        }
    });

    sample({
        source: initParamsUpdate.filterMap(params => (params === "pending" || params === "skip" ? undefined : params)),
        target: initParamsSent
    });
}

function createInitParams(params: { columns: Column[]; ds: ListValue; storage: StorageDone }): InitParams {
    const { storage } = params;
    const settings = storage.status === "ready" ? storage.value.load() : undefined;

    return settings ? paramsFromSettings(settings, params.ds) : paramsFromColumns(params.columns, params.ds);
}
