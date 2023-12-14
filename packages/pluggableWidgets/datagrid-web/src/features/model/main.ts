import { useMemo } from "react";
import { createGate } from "effector-react";
import { Model } from "./base";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { createInitModel } from "./init-model";
import { createGridModel } from "./grid-model";
import { bootstrap } from "./bootstrap";
import { setupEffects } from "./setup-effects";
import { effects } from "./effects";
import { sample } from "effector";

type Props = DatagridContainerProps;

const log = (...args: any[]): void => console.log("DEBUG", performance.now(), ...args);

function createModel(): Model {
    // All prop updates will be propagated through the gate.state.updates;
    const gate = createGate<Props>();

    // Widget props wrapped into event
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

    sample({
        source: gate.close,
        target: grid.cleanup
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
