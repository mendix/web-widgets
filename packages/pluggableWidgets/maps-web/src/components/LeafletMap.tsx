import classNames from "classnames";
import { ReactElement, useCallback } from "react";
import { getDimensions } from "@mendix/widget-plugin-platform/utils/get-dimensions";
import { MapProviderEnum } from "../../typings/MapsProps";
import { SharedProps } from "../../typings/shared";
import { useLeafletMapVM } from "../model/hooks/injection-hooks";

export interface LeafletProps extends SharedProps {
    mapProvider: MapProviderEnum;
    attributionControl: boolean;
}

export function LeafletMap(props: LeafletProps): ReactElement {
    const vm = useLeafletMapVM();

    const refCallback = useCallback(
        (node: HTMLDivElement | null) => {
            if (node) {
                vm.setupMap(node);
            } else {
                vm.disposeMap();
            }
        },
        [vm]
    );

    return (
        <div className={classNames("widget-maps", props.className)} style={{ ...props.style, ...getDimensions(props) }}>
            <div className="widget-leaflet-maps-wrapper">
                <div
                    className="widget-leaflet-maps"
                    ref={refCallback}
                    style={{ top: 0, bottom: 0, left: 0, right: 0, position: "absolute", zIndex: 1 }}
                />
            </div>
        </div>
    );
}
