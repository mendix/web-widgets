import { ContainerProvider } from "brandi-react";
import { ReactNode } from "react";
import { MapsContainerProps } from "../typings/MapsProps";
import { MapsWidget } from "./components/MapsWidget";
import { useMapsContainer } from "./model/hooks/useMapsContainer";
import "leaflet/dist/leaflet.css";
import "./ui/Maps.scss";

export default function Maps(props: MapsContainerProps): ReactNode {
    const container = useMapsContainer(props);

    return (
        <ContainerProvider container={container} isolated>
            <MapsWidget />
        </ContainerProvider>
    );
}
