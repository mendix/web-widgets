import { useMemo } from "react";
import { createGate } from "effector-react";
import { Model } from "./base";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { createInitModel } from "./init-model";
import { createGridModel } from "./grid-model";
import { bootstrap } from "./bootstrap";
import { setupEffects } from "./setup-effects";
import { effects } from "./effects";
import { sample, createStore } from "effector";

type Props = DatagridContainerProps;

const log = (...args: any[]): void => console.log("DEBUG", performance.now(), ...args);

function inspect(a: object, b: object, n = 3, pad = "  "): void {
    for (const key of Object.keys(a) as unknown as Array<keyof object>) {
        const [x, y] = [a[key], b[key]];
        if (x !== y) {
            if ((typeof x === "number" || typeof x === "string") && (typeof y === "number" || typeof y === "string")) {
                log(`${pad}> ${key} changed: ${a[key]} => ${b[key]}`.slice(0, 50));
            } else {
                log(`${pad}> ${key} changed`);
            }
            if (typeof x === "object" && typeof y === "object" && n > 0) {
                if (Array.isArray(x) || Array.isArray(y)) {
                    continue;
                }
                inspect(x, y, n - 1, pad + "  ");
            }
        }
    }
}

function createModel(): Model {
    // Create a Gate.
    // All prop updates will be propagated through the gate.state.updates;
    const gate = createGate<Props>();

    const x = createStore<DatagridContainerProps>({} as any);
    sample({
        clock: gate.state,
        source: x,
        fn: (prev, next) => {
            inspect(prev, next);
            return next;
        },
        target: x
    });

    // widget props wrapped into event
    const propsUpdated = gate.state.updates.filterMap(props => {
        // Filter empty object on unmount
        return Object.keys(props).length > 0 ? props : undefined;
    });
    const modelFxs = effects();
    const { initParamsReady, initParamsSent } = createInitModel();
    const grid = createGridModel(propsUpdated, initParamsReady);

    sample({
        source: gate.close,
        target: modelFxs.abortWriteFx
    });

    // Compute InitParams
    const $status = bootstrap(grid, propsUpdated, initParamsSent, modelFxs);
    // Setup all side effects
    setupEffects(propsUpdated, grid, $status, modelFxs);

    propsUpdated.watch(p => log("props updated", p));
    grid.limitChanged.watch(limit => log("limit changed", limit));
    grid.offsetChanged.watch(offset => log("offset changed", offset));
    $status.watch(v => log("status", v));

    return { gate, status: $status, grid };
}

export function useModel(): Model {
    return useMemo(createModel, []);
}
