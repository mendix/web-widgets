import { ListValue } from "mendix";
import { Event, EventCallable, Store, createEffect, sample } from "effector";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { GridModel, InitParams, Status } from "./base";
import { Column } from "../../helpers/Column";
import { StorageDone } from "../storage/base";
import { paramsFromColumns, paramsFromSettings, sortToInst } from "./utils";

export function setup(
    $status: Store<Status>,
    grid: GridModel,
    propsUpdated: Event<DatagridContainerProps>,
    initParamsSent: EventCallable<InitParams>
): void {
    const params = sample({
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

            const args = {
                columns,
                ds: datasource,
                storage
            };
            return [args, createInitParams(args)] as const;
        }
    });

    const paramsReady = params.filterMap(params => (params === "pending" || params === "skip" ? undefined : params));

    // Initialize datasource sort
    sample({
        source: paramsReady,
        target: createEffect(([args, params]: [{ columns: Column[]; ds: ListValue }, InitParams]) => {
            args.ds.setSortOrder(sortToInst(params.sort, args.columns));
        })
    });

    // Set init params in the grid model
    sample({
        source: paramsReady,
        fn: ([_, params]) => params,
        target: initParamsSent
    });
}

function createInitParams(params: { columns: Column[]; ds: ListValue; storage: StorageDone }): InitParams {
    const { storage } = params;
    const settings = storage.status === "ready" ? storage.value.load() : undefined;

    return settings ? paramsFromSettings(settings, params.ds) : paramsFromColumns(params.columns, params.ds);
}
