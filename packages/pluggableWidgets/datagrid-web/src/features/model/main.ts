import { useMemo } from "react";
import { createGate } from "effector-react";
import { Model } from "./base";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { createInitModel } from "./init-model";
import { createGridModel } from "./grid-model";
import { setup } from "./setup-flow";
import { setupEffects } from "./effects";

type Props = DatagridContainerProps;

function createModel(): Model {
    // Create a Gate.
    // All prop updates will be propagated through the gate.state.updates;
    const gate = createGate<Props>();
    // widget props wrapped into event.
    const propsUpdated = gate.state.updates;
    const { initParamsReady, initParamsSent, $status } = createInitModel();
    const grid = createGridModel(propsUpdated, initParamsReady);

    // Compute InitParams
    setup($status, grid, propsUpdated, initParamsSent);
    // Setup all side effects
    setupEffects(propsUpdated, grid);

    return { gate, status: $status } as unknown as Model;
}

export function useModel(): Model {
    return useMemo(createModel, []);
}
