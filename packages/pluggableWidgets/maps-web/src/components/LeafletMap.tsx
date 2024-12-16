import { createElement, ReactElement, useEffect } from "react";
import { MapContainer, Marker as MarkerComponent, Popup, TileLayer, useMap } from "react-leaflet";
import classNames from "classnames";
import { getDimensions } from "@mendix/widget-plugin-platform/utils/get-dimensions";
import { SharedProps } from "../../typings/shared";
import { MapProviderEnum } from "../../typings/MapsProps";
import { translateZoom } from "../utils/zoom";
import { DivIcon, latLngBounds, Icon as LeafletIcon } from "leaflet";
import { baseMapLayer } from "../utils/leaflet";
import L from "leaflet";

export interface LeafletProps extends SharedProps {
    mapProvider: MapProviderEnum;
    attributionControl: boolean;
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

function SetBoundsComponent(props: Pick<LeafletProps, "autoZoom" | "currentLocation" | "locations">): null {
    const map = useMap();
    const { autoZoom, currentLocation, locations } = props;

    const bounds = latLngBounds(
        locations
            .concat(currentLocation ? [currentLocation] : [])
            .filter(m => !!m)
            .map(m => [m.latitude, m.longitude])
    );

    if (bounds.isValid()) {
        if (autoZoom) {
            map.flyToBounds(bounds, { padding: [0.5, 0.5], animate: false }).invalidateSize();
        } else {
            map.panTo(bounds.getCenter(), { animate: false });
        }
    }

    return null;
}

function ExposeMapInstance() {
    const map = useMap();

    useEffect(() => {
        console.log("Exposing Leaflet map instance globally");
        window.leafletMapInstance = map; // Attach the map instance to the global window object
    }, [map]);

    return null;
}

function GeoJSONLayer({ geoJSON }: { geoJSON?: string }): null {
    const map = useMap();

    useEffect(() => {
        console.log("Adding GeoJSON layer to map:", geoJSON);
        let geoJsonLayer: L.GeoJSON | undefined;

        if (geoJSON) {
            try {
                const geoJSONData = JSON.parse(geoJSON); // Use geoJSON directly
                geoJsonLayer = L.geoJSON(geoJSONData).addTo(map);
                map.fitBounds(geoJsonLayer.getBounds());
            } catch (error) {
                console.error("Invalid GeoJSON data:", error, "GeoJSON:", geoJSON);
            }
        } else {
            console.error("No GeoJSON data provided.");
            map.setView([51.906688, 4.48837], 20); // Default map view
        }

        return () => {
            if (geoJsonLayer) {
                map.removeLayer(geoJsonLayer); // Cleanup
            }
        };
    }, [geoJSON, map]); // Ensure dependencies match the destructured variable

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
        geoJSON
    } = props;

    console.log("[LeafletMap] GeoJSON passed to GeoJSONLayer:", geoJSON);

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
                    zoom={autoZoom ? translateZoom("city") : zoom}
                    zoomControl={zoomControl}
                    whenReady={() => {}}
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
                    <SetBoundsComponent autoZoom={autoZoom} currentLocation={currentLocation} locations={locations} />
                    <ExposeMapInstance />
                    <GeoJSONLayer geoJSON={geoJSON} />
                </MapContainer>
            </div>
        </div>
    );
}
