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
    // widget props wrapped into event
    const propsUpdated = gate.state.updates.filterMap(props => {
        // Filter empty object on unmount
        return Object.keys(props).length > 0 ? props : undefined;
    });
    const { initParamsReady, initParamsSent } = createInitModel();
    const grid = createGridModel(propsUpdated, initParamsReady);

    // Compute InitParams
    const $status = setup(grid, propsUpdated, initParamsSent);
    // Setup all side effects
    setupEffects(propsUpdated, grid, $status);

    propsUpdated.watch(p => console.log("DEBUG props updated", p));
    grid.limitChanged.watch(limit => console.log("DEBUG limit changed", limit));
    grid.offsetChanged.watch(offset => console.log("DEBUG offset changed", offset));
    $status.watch(v => console.log("DEBUG status", v));

    return { gate, status: $status, grid };
}

export function useModel(): Model {
    return useMemo(createModel, []);
}
