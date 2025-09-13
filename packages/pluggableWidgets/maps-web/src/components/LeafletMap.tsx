import { createElement, ReactElement, useEffect, useState } from "react";
import { FeatureCollection } from "geojson";
import { GeoJSON, MapContainer, Marker as MarkerComponent, Popup, TileLayer, useMap } from "react-leaflet";
import classNames from "classnames";
import { getDimensions } from "@mendix/widget-plugin-platform/utils/get-dimensions";
import { GeoJSONFeature, SharedPropsWithDrawing } from "../../typings/shared";
import { MapProviderEnum } from "../../typings/MapsProps";
import { DivIcon, geoJSON, latLngBounds, Icon as LeafletIcon, LatLngBounds } from "leaflet";
import { baseMapLayer, getMaxZoomForProvider } from "../utils/leaflet";
import { LeafletDrawing } from "./LeafletDrawing";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

export interface LeafletProps extends SharedPropsWithDrawing {
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
    props: Pick<LeafletProps, "autoZoom" | "currentLocation" | "locations" | "features" | "enableDrawing">
): null {
    const map = useMap();
    const { autoZoom, currentLocation, locations, features, enableDrawing } = props;
    const [boundsSetForDataHash, setBoundsSetForDataHash] = useState<string>("");

    useEffect(() => {
        // Special handling for drawing mode - zoom to user location at street level
        if (enableDrawing) {
            // Create a hash to prevent multiple geolocation requests
            const drawingDataHash = JSON.stringify({
                enableDrawing: true,
                autoZoom
            });

            if (drawingDataHash === boundsSetForDataHash) {
                return; // Already handled this drawing mode setup
            }

            console.log("SetBoundsComponent: Drawing mode enabled - attempting to get user location");

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        const userLat = position.coords.latitude;
                        const userLng = position.coords.longitude;
                        console.log(
                            `SetBoundsComponent: Got user location: ${userLat}, ${userLng} - zooming to street level`
                        );

                        // Zoom to user location at street level (zoom 16-17 is good for drawing)
                        map.setView([userLat, userLng], 16);
                        setBoundsSetForDataHash(drawingDataHash);
                    },
                    error => {
                        console.warn("SetBoundsComponent: Failed to get user location:", error.message);
                        // Fallback: set a reasonable zoom level at current map center
                        map.setZoom(16);
                        setBoundsSetForDataHash(drawingDataHash);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000 // Cache location for 1 minute
                    }
                );
            } else {
                console.warn("SetBoundsComponent: Geolocation not supported - using default zoom");
                map.setZoom(16);
                setBoundsSetForDataHash(drawingDataHash);
            }
            return;
        }

        // Check if drawing is active before proceeding
        const isDrawingActive =
            typeof window !== "undefined" &&
            (window as any).isLeafletDrawingActive &&
            (window as any).isLeafletDrawingActive();

        if (isDrawingActive) {
            console.log("SetBoundsComponent: Skipping bounds operations - drawing is active");
            return;
        }

        const allLocations = locations.concat(currentLocation ? [currentLocation] : []).filter(m => !!m);

        // Create a hash of current data to avoid setting bounds for the same data multiple times
        const dataHash = JSON.stringify({
            locationCount: allLocations.length,
            locations: allLocations.map(l => `${l.latitude},${l.longitude}`),
            featureCount: features?.length || 0,
            autoZoom
        });

        // If we've already set bounds for this exact data, skip
        if (dataHash === boundsSetForDataHash) {
            return;
        }

        console.log(
            `SetBoundsComponent: Data changed - Found ${allLocations.length} locations, ${features?.length || 0} features`
        );

        // If no locations AND no features, wait for data to load
        if (allLocations.length === 0 && (!features || features.length === 0)) {
            console.log("SetBoundsComponent: No data yet - waiting for locations or features to load");
            return; // Don't set the hash, keep waiting for data
        }

        // Wait a bit for the map to be fully ready, then set bounds
        const timer = setTimeout(() => {
            let bounds: LatLngBounds | null = null;

            // Create bounds from locations if available
            if (allLocations.length > 0) {
                bounds = latLngBounds(allLocations.map(m => [m.latitude, m.longitude]));
                console.log("SetBoundsComponent: Created bounds from locations");
            }

            // Add features to bounds if available
            if (features && features.length > 0) {
                try {
                    const featureCollection: FeatureCollection = {
                        type: "FeatureCollection",
                        features: features.map(feature => JSON.parse(feature.geoJSON))
                    };

                    const tempLayer = geoJSON(featureCollection);
                    const geoJsonBounds = tempLayer.getBounds();
                    if (geoJsonBounds.isValid()) {
                        if (bounds) {
                            bounds.extend(geoJsonBounds);
                            console.log("SetBoundsComponent: Extended bounds with features");
                        } else {
                            bounds = geoJsonBounds;
                            console.log("SetBoundsComponent: Created bounds from features only");
                        }
                    }
                } catch (error) {
                    console.warn("SetBoundsComponent: Error processing features for bounds:", error);
                }
            }

            // Apply bounds if valid
            if (bounds && bounds.isValid()) {
                if (autoZoom) {
                    console.log("SetBoundsComponent: Applying autoZoom with fitBounds");
                    map.fitBounds(bounds, { padding: [20, 20] });
                } else {
                    console.log("SetBoundsComponent: Setting view to bounds center");
                    map.setView(bounds.getCenter(), 13);
                }
                // Mark that we've set bounds for this data
                setBoundsSetForDataHash(dataHash);
            } else {
                console.warn("SetBoundsComponent: No valid bounds found - skipping zoom");
            }
        }, 200); // Slightly longer delay to allow for async data loading

        return () => clearTimeout(timer);
    }, [map, enableDrawing, autoZoom, locations, currentLocation, features, boundsSetForDataHash]);

    return null;
}

function ExposeMapInstance(): null {
    const map = useMap();

    useEffect(() => {
        console.log("Exposing Leaflet map instance globally");
        window.leafletMapInstance = map; // Attach the map instance to the global window object

        // Removed problematic event handlers that were making coordinate offset worse
    }, [map]);

    return null;
}

function MapStabilizer(): null {
    const map = useMap();

    useEffect(() => {
        // Initial map stabilization after mount
        const initialTimer = setTimeout(() => {
            console.log("MapStabilizer: Initial map invalidateSize");
            map.invalidateSize(true);
        }, 100);

        // Set up ResizeObserver to handle container changes
        let resizeObserver: ResizeObserver | null = null;

        if (typeof window !== "undefined" && window.ResizeObserver) {
            const container = map.getContainer();
            if (container) {
                resizeObserver = new ResizeObserver(entries => {
                    // Check if drawing is active before invalidating size
                    const isDrawingActive =
                        typeof window !== "undefined" &&
                        (window as any).isLeafletDrawingActive &&
                        (window as any).isLeafletDrawingActive();

                    if (isDrawingActive) {
                        console.log("MapStabilizer: Skipping invalidateSize - drawing is active");
                        return;
                    }

                    for (const entry of entries) {
                        if (entry.target === container) {
                            console.log("MapStabilizer: Container resized, calling invalidateSize");
                            // Debounce resize calls
                            setTimeout(() => {
                                if (
                                    !(
                                        (window as any).isLeafletDrawingActive &&
                                        (window as any).isLeafletDrawingActive()
                                    )
                                ) {
                                    map.invalidateSize(true);
                                }
                            }, 50);
                        }
                    }
                });

                resizeObserver.observe(container);
            }
        }

        return () => {
            clearTimeout(initialTimer);
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };
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
        features,
        enableDrawing,
        drawingTools,
        drawnGeoJSONAttribute,
        onDrawComplete,
        allowEdit,
        allowDelete
    } = props;

    // Get provider-specific maximum zoom level
    const maxZoom = getMaxZoomForProvider(mapProvider);
    console.log(`LeafletMap: Using maxZoom ${maxZoom} for provider ${mapProvider}`);

    console.log("[LeafletMap] Features: ", features);

    return (
        <div className={classNames("widget-maps", className)} style={{ ...style, ...getDimensions(props) }}>
            <div className="widget-leaflet-maps-wrapper">
                <MapContainer
                    attributionControl={attributionControl}
                    center={center}
                    className="widget-leaflet-maps"
                    dragging={dragging}
                    maxZoom={maxZoom}
                    minZoom={1}
                    scrollWheelZoom={scrollWheelZoom}
                    zoom={zoom}
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
                                              className: "custom-leaflet-map-icon-marker",
                                              iconSize: [32, 32], // Set proper icon size
                                              iconAnchor: [16, 32] // Anchor at bottom center of icon
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
                        enableDrawing={enableDrawing}
                    />
                    <ExposeMapInstance />
                    <MapStabilizer />
                    {features && <GeoJSONLayer features={features} />}
                    {enableDrawing && (
                        <LeafletDrawing
                            enableDrawing={enableDrawing}
                            drawingTools={drawingTools}
                            drawnGeoJSONAttribute={drawnGeoJSONAttribute}
                            onDrawComplete={onDrawComplete}
                            allowEdit={allowEdit}
                            allowDelete={allowDelete}
                        />
                    )}
                </MapContainer>
            </div>
        </div>
    );
}
