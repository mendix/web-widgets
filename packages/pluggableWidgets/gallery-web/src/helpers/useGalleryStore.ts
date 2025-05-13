import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { useEffect } from "react";
import { GalleryContainerProps } from "../../typings/GalleryProps";
import { GalleryPropsGate, GalleryStore } from "../stores/GalleryStore";

export function useGalleryStore(props: GalleryContainerProps): GalleryStore {
    const gate = useGate(props);
    const store = useSetup(
        () => new GalleryStore({ gate, ...props, showPagingButtons: "auto", showTotalCount: false })
    );
    return store;
}

function useGate(props: GalleryContainerProps): GalleryPropsGate {
    const gateProvider = useConst(() => new GateProvider(props));
    useEffect(() => gateProvider.setProps(props));
    return gateProvider.gate;
}
