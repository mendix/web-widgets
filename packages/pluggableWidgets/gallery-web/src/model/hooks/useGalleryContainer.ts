import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";

import { Container } from "brandi";
import { useEffect } from "react";
import { GalleryContainerProps } from "../../../typings/GalleryProps";
import { createGalleryContainer } from "../containers/createGalleryContainer";
import { CORE_TOKENS as CORE } from "../tokens";

export function useGalleryContainer(props: GalleryContainerProps): Container {
    const [container, mainProvider] = useConst(() => createGalleryContainer(props));

    // Run setup hooks on mount
    useSetup(() => container.get(CORE.setupService));

    useEffect(() => mainProvider.setProps(props));

    return container;
}
