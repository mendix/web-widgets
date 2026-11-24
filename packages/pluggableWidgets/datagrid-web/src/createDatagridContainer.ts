import { DatagridContainer } from "./Datagrid.container";
import { RootContainer } from "./Root.container";
import { DatagridContainerProps } from "../typings/DatagridProps";
import { MainGateProps } from "../typings/MainGateProps";
import { datagridConfig } from "./features/core/configs/Datagrid.config";
import { MainGateProvider } from "./features/core/services/MainGateProvider.service";
import { SelectAllModule } from "./features/selection/select-all/SelectAllModule.container";

export function createDatagridContainer(
    props: DatagridContainerProps
): [DatagridContainer, SelectAllModule, MainGateProvider<MainGateProps>] {
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
}
