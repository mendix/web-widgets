import { EventCallable, createEffect, createEvent, createStore, split } from "effector";
import { InitParams, Status } from "./base";

export function createInitModel(): {
    // Read event for stores
    initParamsReady: EventCallable<InitParams>;
    // Write event for effects/events
    initParamsSent: EventCallable<InitParams>;
} {
    const initParamsSent = createEvent<InitParams>();
    const initParamsReady = createEvent<InitParams>();
    const misuseOfReady = createEffect(() => console.warn("initParamsSent is called more then one time."));
    const $status = createStore<Status>("pending").on(initParamsReady, () => "ready");

    split({
        source: initParamsSent,
        match: $status,
        cases: {
            pending: initParamsReady,
            ready: misuseOfReady
        }
    });

    return { initParamsReady, initParamsSent };
}
