import { ClosableGateProvider } from "@mendix/widget-plugin-mobx-kit/ClosableGateProvider";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { useEffect } from "react";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { ProgressStore } from "../../features/data-export/ProgressStore";
import { RootGridStore } from "./RootGridStore";

export function useRootStore(props: DatagridContainerProps): RootGridStore {
    const [gateProvider, exportProgressCtrl] = useConst(() => {
        const epc = new ProgressStore();
        const gp = new ClosableGateProvider(props, () => epc.exporting);
        return [gp, epc] as const;
    });
    const rootStore = useSetup(() => new RootGridStore({ gate: gateProvider.gate, exportCtrl: exportProgressCtrl }));

    useEffect(() => {
        gateProvider.setProps(props);
    });

    return rootStore;
}
