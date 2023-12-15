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
        console.log("DEBUG params ready");
        dataReady(params);
        effects.setViewStateAndReloadFx([ds, sortToInst(params.sort, columns), undefined]);
        viewRestored();
    });

    // after params set, send params to the model
    sample({
        clock: payloadReady,
        target: setViewStateFx
    });

    sample({
        clock: propsUpdated,
        source: $status,
        filter: status => status === "waitingDatasource",
        target: bootstrapEnd
    });

    bootstrapEnd.watch(() => console.log("DEBUG bootstrap end"));

    return $status;
}

function createInitParams(params: { columns: Column[]; ds: ListValue; storage: StorageDone }): InitParams {
    const { storage } = params;
    const settings = storage.status === "ready" ? storage.value.load() : undefined;

    return settings ? paramsFromSettings(settings, params.ds) : paramsFromColumns(params.columns, params.ds);
}
