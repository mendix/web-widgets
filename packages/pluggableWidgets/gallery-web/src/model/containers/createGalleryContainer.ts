import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { GalleryContainer } from "./Gallery.container";
import { RootContainer } from "./Root.container";
import { GalleryContainerProps } from "../../../typings/GalleryProps";
import { GalleryGateProps } from "../../typings/GalleryGateProps";
import { galleryConfig } from "../configs/Gallery.config";

export function createGalleryContainer(
    props: GalleryContainerProps
): [GalleryContainer, GateProvider<GalleryGateProps>] {
    const root = new RootContainer();
    const config = galleryConfig(props);
    const mainProvider = new GateProvider<GalleryGateProps>(props);
    const container = new GalleryContainer(root).init({
        props,
        config,
        mainGate: mainProvider.gate
    });

    return [container, mainProvider];
}
