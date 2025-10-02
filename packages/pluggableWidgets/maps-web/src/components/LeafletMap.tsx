import { createElement, ReactElement, useEffect } from "react";
import { MapContainer, Marker as MarkerComponent, Popup, TileLayer, useMap } from "react-leaflet";
import classNames from "classnames";
import { getDimensions } from "@mendix/widget-plugin-platform/utils/get-dimensions";
import { SharedProps } from "../../typings/shared";
import { MapProviderEnum } from "../../typings/MapsProps";
import { translateZoom } from "../utils/zoom";
import { Icon as LeafletIcon, DivIcon, latLngBounds } from "leaflet";
import { baseMapLayer } from "../utils/leaflet";

// Global variable for marker render delay
const MARKER_RENDER_DELAY = 100;

export interface LeafletProps extends SharedProps {
    mapProvider: MapProviderEnum;
    attributionControl: boolean;
    maxAutoZoom: number; // Maximum zoom level when autoZoom is enabled
}

/**
 * There is an ongoing issue in `react-leaflet` that fails to properly set the icon urls in the
 * default marker implementation. Issue https://github.com/PaulLeCam/react-leaflet/issues/453
 * describes the problem and also proposes a few solutions. But all of them require a hackish method
 * to override `leaflet`'s implementation of the default Icon. Instead, we always set the
 * `Marker.icon` prop instead of relying on the default. So if a custom icon is set, we use that.
 * If not, we reuse a leaflet icon that's the same as the default implementation should be.
 */
const defaultMarkerIcon = new LeafletIcon({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    iconRetinaUrl: require("leaflet/dist/images/marker-icon.png"),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

function SetBoundsComponent(
    props: Pick<LeafletProps, "autoZoom" | "currentLocation" | "locations" | "maxAutoZoom">
): null {
    const map = useMap();
    const { autoZoom, currentLocation, locations, maxAutoZoom } = props;

    useEffect(() => {
        if (map) {
            // Add a small delay to ensure markers are rendered
            const timer = setTimeout(() => {
                const allMarkers = locations.concat(currentLocation ? [currentLocation] : []).filter(m => !!m);

                if (allMarkers.length > 0) {
                    const lats = allMarkers.map(m => m.latitude);
                    const lngs = allMarkers.map(m => m.longitude);

                    const southWest = [Math.min(...lats), Math.min(...lngs)] as [number, number];
                    const northEast = [Math.max(...lats), Math.max(...lngs)] as [number, number];

                    if (autoZoom) {
                        // Use more conservative options for flyToBounds
                        const flyOptions = {
                            padding: [20, 20] as [number, number], // Use pixel padding
                            animate: false,
                            maxZoom: maxAutoZoom // Limit maximum zoom to prevent over-zooming
                        };

                        map.flyToBounds([southWest, northEast], flyOptions);

                        // Force invalidate size after bounds are set
                        setTimeout(() => {
                            map.invalidateSize();
                        }, 50);
                    } else {
                        const centerLat = (southWest[0] + northEast[0]) / 2;
                        const centerLng = (southWest[1] + northEast[1]) / 2;
                        map.panTo([centerLat, centerLng], { animate: false });
                    }
                }
            }, MARKER_RENDER_DELAY);

            return () => clearTimeout(timer);
        }
    }, [map, locations, currentLocation, autoZoom]);

    return null;
}

export function LeafletMap(props: LeafletProps): ReactElement {
    const center = { lat: 51.906688, lng: 4.48837 };
    const {
        autoZoom,
        attributionControl,
        className,
        currentLocation,
        locations,
        mapProvider,
        mapsToken,
        optionScroll: scrollWheelZoom,
        optionZoomControl: zoomControl,
        style,
        zoomLevel: zoom,
        optionDrag: dragging,
        maxAutoZoom: maxAutoZoom = 13
    } = props;

    // Use a lower initial zoom when autoZoom is enabled to prevent conflicts
    const initialZoom = autoZoom ? Math.min(translateZoom("city"), zoom) : zoom;

    return (
        <div className={classNames("widget-maps", className)} style={{ ...style, ...getDimensions(props) }}>
            <div className="widget-leaflet-maps-wrapper">
                <MapContainer
                    attributionControl={attributionControl}
                    center={center}
                    className="widget-leaflet-maps"
                    dragging={dragging}
                    maxZoom={18}
                    minZoom={1}
                    scrollWheelZoom={scrollWheelZoom}
                    zoom={initialZoom}
                    zoomControl={zoomControl}
                >
                    <TileLayer {...baseMapLayer(mapProvider, mapsToken)} />
                    {locations
                        .concat(currentLocation ? [currentLocation] : [])
                        .filter(m => !!m)
                        .map(marker => (
                            <MarkerComponent
                                icon={
                                    marker.url
                                        ? new DivIcon({
                                              html: `<img src="${marker.url}" class="custom-leaflet-map-icon-marker-icon" alt="map marker" />`,
                                              className: "custom-leaflet-map-icon-marker"
                                          })
                                        : defaultMarkerIcon
                                }
                                interactive={!!marker.title || !!marker.onClick}
                                key={`marker_${marker.id ?? marker.latitude + "_" + marker.longitude}`}
                                eventHandlers={marker.title ? undefined : { click: marker.onClick }}
                                position={{ lat: marker.latitude, lng: marker.longitude }}
                                title={marker.title}
                            >
                                {marker.title && (
                                    <Popup>
                                        <span
                                            style={{ cursor: marker.onClick ? "pointer" : "none" }}
                                            onClick={marker.onClick}
                                        >
                                            {marker.title}
                                        </span>
                                    </Popup>
                                )}
                            </MarkerComponent>
                        ))}
                    <SetBoundsComponent
                        autoZoom={autoZoom}
                        currentLocation={currentLocation}
                        locations={locations}
                        maxAutoZoom={maxAutoZoom}
                    />
                </MapContainer>
            </div>
        </div>
    );
}
