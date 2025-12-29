import { ContainerProvider } from "brandi-react";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { GalleryContainerProps } from "../typings/GalleryProps";
import { useGalleryContainer } from "./model/hooks/useGalleryContainer";

const GalleryWidget = observer(function GalleryWidget(): ReactElement {
    return <div />;
});

export function Gallery(props: GalleryContainerProps): ReactElement {
    const container = useGalleryContainer(props);

    return (
        <ContainerProvider container={container} isolated>
            <GalleryWidget />
        </ContainerProvider>
    );
}
