import { SelectAllHost } from "@mendix/widget-plugin-grid/selection";
import { ProgressStore } from "@mendix/widget-plugin-grid/stores/ProgressStore";
import { ClosableGateProvider } from "@mendix/widget-plugin-mobx-kit/ClosableGateProvider";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { useEffect } from "react";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { RootGridStore } from "./RootGridStore";

export function useRootStore(props: DatagridContainerProps): RootGridStore {
    const exportProgressStore = useConst(() => new ProgressStore());

    const selectAllProgressStore = useConst(() => new ProgressStore());

    const mainGateProvider = useConst(() => {
        // Closed when exporting or selecting all
        return new ClosableGateProvider(props, () => {
            return exportProgressStore.inProgress || selectAllProgressStore.inProgress;
        });
    });

    const selectAllGateProvider = useConst(() => new GateProvider(props));

    const selectAllHost = useSetup(() => new SelectAllHost(selectAllGateProvider.gate, selectAllProgressStore));

    const rootStore = useSetup(
        () =>
            new RootGridStore({
                gate: mainGateProvider.gate,
                exportProgressStore,
                selectAllProgressStore,
                selectAllController: selectAllHost.selectAllController
            })
    );

    useEffect(() => {
        mainGateProvider.setProps(props);
        selectAllGateProvider.setProps(props);
    });

    return rootStore;
}
