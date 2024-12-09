import { createElement, ReactElement, useEffect, useState, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import classNames from "classnames";
import { getDimensions } from "@mendix/widget-plugin-platform/utils/get-dimensions";
import { SharedProps } from "../../typings/shared";
import { MapProviderEnum } from "../../typings/MapsProps";
import { translateZoom } from "../utils/zoom";
import { getMapStyle } from "../utils/maplibre";
import "../ui/Maps.scss";

export interface MapLibreProps extends SharedProps {
    mapProvider: MapProviderEnum;
    attributionControl: boolean;
}

export function MapLibreComponent(props: MapLibreProps): ReactElement {
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
        optionDrag: dragging
    } = props;

    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [tileError, setTileError] = useState<string | null>(null);

    useEffect(() => {
        if (!mapContainer.current) {
            return;
        }

        try {
            console.log("Initializing map with style:", getMapStyle(mapProvider, mapsToken));

            map.current = new maplibregl.Map({
                container: mapContainer.current,
                style: getMapStyle(mapProvider, mapsToken),
                center: [4.48837, 51.906688],
                zoom: Math.min(autoZoom ? translateZoom("city") : zoom, 18),
                maxZoom: 18,
                minZoom: 1,
                attributionControl,
                dragPan: dragging,
                scrollZoom: scrollWheelZoom
            });

            map.current.on("load", () => {
                console.log("Map loaded successfully");
                setIsLoading(false);
            });

            map.current.on("error", e => {
                console.error("Map error:", e);
                setTileError(e.error?.message || "Failed to load map tiles");
                setIsLoading(false);
            });

            map.current.on("zoom", () => {
                if (map.current && map.current.getZoom() > 18) {
                    map.current.setZoom(18);
                }
            });

            return () => {
                if (map.current) {
                    console.log("Cleaning up map instance");
                    map.current.remove();
                }
            };
        } catch (error) {
            console.error("Error initializing map:", error);
            setTileError(error instanceof Error ? error.message : "Failed to initialize map");
            setIsLoading(false);
        }
    }, [mapProvider, mapsToken, attributionControl, autoZoom, dragging, scrollWheelZoom, zoom]);

    useEffect(() => {
        if (!map.current || !locations.length) {
            return;
        }

        const points = [...locations, ...(currentLocation ? [currentLocation] : [])];
        if (points.length === 0) {
            return;
        }

        // Add markers
        points.forEach(marker => {
            const el = document.createElement("div");
            if (marker.url) {
                el.className = "custom-marker-icon";
                const img = document.createElement("img");
                img.src = marker.url;
                img.alt = "marker";
                el.appendChild(img);
            } else {
                el.className = "default-marker";
            }

            const markerInstance = new maplibregl.Marker(el)
                .setLngLat([marker.longitude, marker.latitude])
                .addTo(map.current!);

            if (marker.title || marker.onClick) {
                const popup = new maplibregl.Popup({ closeButton: true }).setHTML(marker.title || "");

                if (marker.onClick) {
                    el.style.cursor = "pointer";
                    el.addEventListener("click", marker.onClick);
                }

                if (marker.title) {
                    markerInstance.setPopup(popup);
                }
            }
        });

        if (autoZoom) {
            const bounds = new maplibregl.LngLatBounds();
            points.forEach(point => {
                bounds.extend([point.longitude, point.latitude]);
            });
            map.current.fitBounds(bounds, { padding: 50 });
        }
    }, [locations, currentLocation, autoZoom]);

    return (
        <div className={classNames("widget-maps", className)} style={{ ...style, ...getDimensions(props) }}>
            {isLoading && <div className="map-loading-overlay">Loading map...</div>}
            {tileError && <div className="map-error-overlay">{tileError}</div>}
            <div ref={mapContainer} className="map-container" style={{ width: "100%", height: "100%" }} />
            {zoomControl && map.current && (
                <div className="maplibregl-ctrl-top-right">
                    <div className="maplibregl-ctrl maplibregl-ctrl-group">
                        <button className="maplibregl-ctrl-zoom-in" onClick={() => map.current?.zoomIn()}>
                            +
                        </button>
                        <button className="maplibregl-ctrl-zoom-out" onClick={() => map.current?.zoomOut()}>
                            -
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
