import { useMemo } from "react";
import { createGate } from "effector-react";
import { Model } from "./base";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { createInitModel } from "./init-model";
import { createGridModel } from "./grid-model";
import { setup } from "./setup-flow";

type Props = DatagridContainerProps;

function createModel(): Model {
    const gate = createGate<Props>();
    const propsUpdated = gate.state.updates;
    const { initParamsReady, initParamsSent, $status } = createInitModel();
    const grid = createGridModel(propsUpdated, initParamsReady);

    setup($status, grid, propsUpdated, initParamsSent);

    return { gate, status: $status } as unknown as Model;
}

export function useModel(): Model {
    return useMemo(createModel, []);
}
