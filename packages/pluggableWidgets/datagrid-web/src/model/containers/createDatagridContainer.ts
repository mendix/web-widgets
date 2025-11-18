import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { MainGateProps } from "../../../typings/MainGateProps";
import { SelectAllModule } from "../../features/select-all/SelectAllModule.container";
import { datagridConfig } from "../configs/Datagrid.config";
import { MainGateProvider } from "../services/MainGateProvider.service";
import { DatagridContainer } from "./Datagrid.container";
import { RootContainer } from "./Root.container";

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
