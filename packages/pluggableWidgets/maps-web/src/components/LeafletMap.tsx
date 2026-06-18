import classNames from "classnames";
import { ReactElement, useCallback, useRef } from "react";
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
    const cleanupRef = useRef<(() => void) | undefined>(undefined);

    const refCallback = useCallback(
        (node: HTMLDivElement | null) => {
            cleanupRef.current?.();
            cleanupRef.current = undefined;

            if (node) {
                cleanupRef.current = vm.setupMap(node);
                // React 19: returned cleanup is called on unmount.
                // React 18: ignored (cleanup happens via null-call above).
                return () => {
                    cleanupRef.current?.();
                    cleanupRef.current = undefined;
                };
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
