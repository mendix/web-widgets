import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { Container } from "brandi";
import { useEffect } from "react";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { SelectAllModule } from "../../features/select-all/SelectAllModule.container";
import { DatagridContainer } from "../containers/Datagrid.container";
import { RootContainer } from "../containers/Root.container";
import { TOKENS } from "../tokens";

export function useDatagridContainer(props: DatagridContainerProps): Container {
    const [container, selectAllModule] = useConst(function init(): [DatagridContainer, SelectAllModule] {
        const root = new RootContainer();
        const selectAllModule = new SelectAllModule().init(props, root);
        const container = new DatagridContainer().init(props, root, selectAllModule);

        return [container, selectAllModule];
    });

    // Run setup hooks on mount
    useSetup(() => container.get(TOKENS.setupService));

    // Push props through the gates
    useEffect(() => {
        container.setProps(props);
        selectAllModule.setProps(props);
    });

    return container;
}
