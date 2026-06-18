import classNames from "classnames";
import { ReactElement, useEffect, useRef } from "react";
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
    const mapNodeRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const node = mapNodeRef.current;
        if (!node) {
            return;
        }

        const cleanup = vm.setupMap(node);

        return () => {
            cleanup();
        };
    }, [vm]);

    return (
        <div className={classNames("widget-maps", props.className)} style={{ ...props.style, ...getDimensions(props) }}>
            <div className="widget-leaflet-maps-wrapper">
                <div
                    className="widget-leaflet-maps"
                    ref={mapNodeRef}
                    style={{ top: 0, bottom: 0, left: 0, right: 0, position: "absolute", zIndex: 1 }}
                />
            </div>
        </div>
    );
}
