import { ContainerProvider } from "brandi-react";
import { ReactElement } from "react";
import { GalleryContainerProps } from "../typings/GalleryProps";
import { GalleryWidget } from "./components/GalleryWidget";
import { useGalleryContainer } from "./model/hooks/useGalleryContainer";

export function Gallery(props: GalleryContainerProps): ReactElement {
    const container = useGalleryContainer(props);

    return (
        <ContainerProvider container={container} isolated>
            <GalleryWidget />
        </ContainerProvider>
    );
}
