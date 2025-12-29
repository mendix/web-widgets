import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { Container } from "brandi";
import { useEffect } from "react";
import { GalleryContainerProps } from "../../../typings/GalleryProps";
import { createGalleryContainer } from "../containers/createGalleryContainer";

export function useGalleryContainer(props: GalleryContainerProps): Container {
    const [container, mainProvider] = useConst(() => createGalleryContainer(props));

    useEffect(() => mainProvider.setProps(props));

    return container;
}
