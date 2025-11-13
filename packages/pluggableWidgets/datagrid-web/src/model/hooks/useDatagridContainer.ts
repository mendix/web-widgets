import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { Container } from "brandi";
import { useEffect } from "react";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { MainGateProps } from "../../../typings/MainGateProps";
import { SelectAllModule } from "../../features/select-all/SelectAllModule.container";
import { datagridConfig } from "../configs/Datagrid.config";
import { DatagridContainer } from "../containers/Datagrid.container";
import { RootContainer } from "../containers/Root.container";
import { MainGateProvider } from "../services/MainGateProvider.service";
import { CORE_TOKENS as CORE } from "../tokens";

export function useDatagridContainer(props: DatagridContainerProps): Container {
    const [container, selectAllModule, mainProvider] = useConst(function init(): [
        DatagridContainer,
        SelectAllModule,
        MainGateProvider<MainGateProps>
    ] {
        const root = new RootContainer();
        const config = datagridConfig(props);
        const mainProvider = new MainGateProvider(props);
        const selectAllModule = new SelectAllModule(root).init({
            props,
            config,
            mainGate: mainProvider.gate,
            progressSrv: mainProvider.selectAllProgress
        });
        const container = new DatagridContainer(root).init({
            props,
            config,
            selectAllModule,
            mainGate: mainProvider.gate,
            exportProgressService: mainProvider.exportProgress
        });

        return [container, selectAllModule, mainProvider];
    });

    // Run setup hooks on mount
    useSetup(() => container.get(CORE.setupService));

    // Push props through the gates
    useEffect(() => {
        mainProvider.setProps(props);
        selectAllModule.setProps(props);
    });

    return container;
}
