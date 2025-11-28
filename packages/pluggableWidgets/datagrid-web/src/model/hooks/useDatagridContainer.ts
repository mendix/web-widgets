import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { Container } from "brandi";
import { useEffect } from "react";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { createDatagridContainer } from "../containers/createDatagridContainer";
import { CORE_TOKENS as CORE } from "../tokens";

export function useDatagridContainer(props: DatagridContainerProps): Container {
    const [container, selectAllModule, mainProvider] = useConst(() => createDatagridContainer(props));

    // Run setup hooks on mount
    useSetup(() => container.get(CORE.setupService));

    // Push props through the gates
    useEffect(() => {
        mainProvider.setProps(props);
        selectAllModule.setProps(props);
    });

    return container;
}
