import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { MapsContainer } from "./Maps.container";
import { RootContainer } from "./Root.container";
import { MapsContainerProps } from "../../../typings/MapsProps";
import { mapsConfig } from "../configs/Maps.config";

export function createMapsContainer(props: MapsContainerProps): [MapsContainer, GateProvider<MapsContainerProps>] {
    const root = new RootContainer();
    const config = mapsConfig(props);
    const mainProvider = new GateProvider<MapsContainerProps>(props);
    const container = new MapsContainer(root).init({
        props,
        config,
        mainGate: mainProvider.gate
    });

    return [container, mainProvider];
}
