import { createElement, ReactElement, useEffect, useState } from "react";
import { FeatureCollection } from "geojson";
import { MapContainer, Marker as MarkerComponent, Popup, TileLayer, useMap, GeoJSON } from "react-leaflet";
import classNames from "classnames";
import { getDimensions } from "@mendix/widget-plugin-platform/utils/get-dimensions";
import { SharedProps } from "../../typings/shared";
import { MapProviderEnum } from "../../typings/MapsProps";
import { translateZoom } from "../utils/zoom";
import { latLngBounds, Icon as LeafletIcon, DivIcon, geoJSON } from "leaflet";
import { baseMapLayer } from "../utils/leaflet";
import { GeoJSONFeature } from "../../typings/shared";

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

function SetBoundsComponent(
    props: Pick<LeafletProps, "autoZoom" | "currentLocation" | "locations" | "features">
): null {
    const map = useMap();
    const { autoZoom, currentLocation, locations, features } = props;
    const [initialBoundsSet, setInitialBoundsSet] = useState(false);

    useEffect(() => {
        // Only update bounds if they haven't been set already
        if (initialBoundsSet) {
            return;
        }
        const bounds = latLngBounds(
            locations
                .concat(currentLocation ? [currentLocation] : [])
                .filter(m => !!m)
                .map(m => [m.latitude, m.longitude])
        );

        // If there are GeoJSON features, compute their bounds
        if (features && features.length > 0) {
            const featureCollection: FeatureCollection = {
                type: "FeatureCollection",
                features: features.map(feature => JSON.parse(feature.geoJSON))
            };

            const tempLayer = geoJSON(featureCollection);
            const geoJsonBounds = tempLayer.getBounds();
            if (geoJsonBounds.isValid()) {
                bounds.extend(geoJsonBounds);
            }
        }

        if (bounds.isValid()) {
            if (autoZoom) {
                map.flyToBounds(bounds, { padding: [0.5, 0.5], animate: false }).invalidateSize();
            } else {
                map.panTo(bounds.getCenter(), { animate: false });
            }
            setInitialBoundsSet(true);
        }
    }, [autoZoom, currentLocation, locations, features, map, initialBoundsSet]);

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

function GeoJSONLayer({ features }: { features: GeoJSONFeature[] }): React.ReactElement | null {
    if (!features || features.length === 0) {
        return null;
    }

    // const geoJSONData: FeatureCollection = {
    //     type: "FeatureCollection",
    //     features: features.map((feature) => ({
    //         type: "Feature",
    //         geometry: JSON.parse(feature.geoJSON),
    //         properties: {
    //             color: feature.color ?? "#3388ff",
    //             stroke: feature.stroke ?? true,
    //             weight: feature.weight ?? 3,
    //             opacity: feature.opacity ?? 1.0,
    //             fill: feature.fill ?? true,
    //             fillColor: feature.fillColor ?? "#3388ff",
    //             fillOpacity: feature.fillOpacity ?? 0.2,
    //             onClick: feature.onClickAttribute,
    //         },
    //     }))
    // };

    const geoJSONData: FeatureCollection = {
        type: "FeatureCollection",
        features: features.map(feature => {
            const parsedGeoJSON = JSON.parse(feature.geoJSON); // Parse the full GeoJSON feature

            console.log("Feature:", feature);
            // Merge additional properties with the parsed properties
            return {
                ...parsedGeoJSON, // Use the parsed Feature as the base
                properties: {
                    ...parsedGeoJSON.properties, // Keep existing properties
                    color: feature.color ?? "#3388ff",
                    stroke: feature.stroke ?? true,
                    weight: feature.weight ?? 3,
                    opacity: feature.opacity ?? 1.0,
                    fill: feature.fill ?? true,
                    fillColor: feature.fillColor ?? "#3388ff",
                    fillOpacity: feature.fillOpacity ?? 0.2,
                    onClick: feature.onClickAttribute // Add the click action
                }
            };
        })
    };

    return (
        <GeoJSON
            data={geoJSONData}
            onEachFeature={(feature, layer) => {
                console.log("onEachFeature called for feature:", feature);
                if (feature.properties?.onClick) {
                    layer.on("click", () => {
                        console.log("GeoJSON feature clicked:", feature);
                        // If the Mendix action requires executing, call execute(), otherwise call it directly.
                        if (feature.properties.onClick.execute) {
                            feature.properties.onClick.execute();
                        } else {
                            feature.properties.onClick();
                        }
                    });
                }
            }}
        />
    );
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
        features
    } = props;

    console.log("[LeafletMap] Features: ", features);

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
                    <SetBoundsComponent
                        autoZoom={autoZoom}
                        currentLocation={currentLocation}
                        locations={locations}
                        features={features}
                    />
                    <ExposeMapInstance />
                    {features && <GeoJSONLayer features={features} />}
                </MapContainer>
            </div>
        </div>
    );
}
