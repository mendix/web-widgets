import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { Container } from "brandi";
import { useEffect } from "react";
import { MapsContainerProps } from "../../../typings/MapsProps";
import { createMapsContainer } from "../containers/createMapsContainer";
import { CORE_TOKENS as CORE } from "../tokens";

export function useMapsContainer(props: MapsContainerProps): Container {
    const [container, mainProvider] = useConst(() => createMapsContainer(props));

    // Run setup hooks on mount
    useSetup(() => container.get(CORE.setupService));

    useEffect(() => mainProvider.setProps(props));

    return container;
}
