import { ListValue } from "mendix";
import { Event, EventCallable, Store, sample, createStore, createEvent, createEffect } from "effector";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { Model, InitParams, Status } from "./base";
import { Column } from "../../helpers/Column";
import { StorageDone } from "../storage/base";
import { paramsFromColumns, paramsFromSettings, sortToInst } from "./utils";
import { ModelEffects } from "./effects";

type InitArgs = { columns: Column[]; ds: ListValue; storage: StorageDone };
type InitPayload = [InitArgs, InitParams];

export function bootstrap(
    grid: Model,
    propsUpdated: Event<DatagridContainerProps>,
    dataReady: EventCallable<InitParams>,
    effects: ModelEffects
): Store<Status> {
    const payload = createEvent<InitPayload | "pending">();
    const payloadReady = payload.filterMap(payload => (payload === "pending" ? undefined : payload));
    const bootstrapEnd = createEvent();
    const viewRestored = createEvent();
    // pending -- waiting for props to become available
    // waitingDatasource -- all set, waiting datasource to be updated
    // By having "waitingDatasource" "step" we prevent ui flickering
    // ready -- bootstrap is done, we ready to show grid.
    const $status = createStore<Status>("pending")
        .on(viewRestored, () => "waitingDatasource")
        .on(bootstrapEnd, () => "ready");

    // loading init params
    sample({
        clock: propsUpdated,
        source: {
            status: $status,
            columns: grid.columns,
            storage: grid.storage
        },
        filter: ({ status }) => status === "pending",
        fn: ({ columns, storage }, { datasource }) => {
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
            return [args, createInitParams(args)] as InitPayload;
        },
        target: payload
    });

    const setViewStateFx = createEffect(([{ ds, columns }, params]: InitPayload) => {
        dataReady(params);
        effects.setViewStateAndReloadFx([ds, sortToInst(params.sort, columns), params.filter]);
        viewRestored();
    });

    // once payload is ready, reset state and set view state of datasource
    sample({
        clock: payloadReady,
        target: setViewStateFx
    });

    // End bootstrap on next reload
    sample({
        clock: propsUpdated,
        source: $status,
        filter: status => status === "waitingDatasource",
        target: bootstrapEnd
    });

    return $status;
}

function createInitParams(params: { columns: Column[]; ds: ListValue; storage: StorageDone }): InitParams {
    const { storage } = params;
    const settings = storage.status === "ready" ? storage.value.load() : undefined;

    return settings ? paramsFromSettings(settings, params.ds) : paramsFromColumns(params.columns, params.ds);
}
