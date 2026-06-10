import classNames from "classnames";
import {
    DivIcon,
    Icon as LeafletIcon,
    latLngBounds,
    Map as LeafletMapInstance,
    Marker as LeafletMarker,
    TileLayer
} from "leaflet";
import { ReactElement, useEffect, useRef } from "react";
import { getDimensions } from "@mendix/widget-plugin-platform/utils/get-dimensions";
import { MapProviderEnum } from "../../typings/MapsProps";
import { Marker, SharedProps } from "../../typings/shared";
import { baseMapLayer } from "../utils/leaflet";
import { translateZoom } from "../utils/zoom";

export interface LeafletProps extends SharedProps {
    mapProvider: MapProviderEnum;
    attributionControl: boolean;
}

/**
 * Leaflet fails to properly resolve the icon urls of the default marker implementation when the
 * library is bundled (the urls are derived from the stylesheet location at runtime). Instead of
 * patching `Icon.Default`, we always set the `icon` option explicitly. So if a custom icon is set,
 * we use that. If not, we reuse a leaflet icon that's the same as the default implementation
 * should be.
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

function createMarkerIcon(marker: Marker): DivIcon | LeafletIcon {
    return marker.url
        ? new DivIcon({
              html: `<img src="${marker.url}" class="custom-leaflet-map-icon-marker-icon" alt="map marker" />`,
              className: "custom-leaflet-map-icon-marker"
          })
        : defaultMarkerIcon;
}

function createPopupContent(marker: Marker): HTMLElement {
    const content = document.createElement("span");
    content.textContent = marker.title ?? "";
    content.style.cursor = marker.onClick ? "pointer" : "none";
    if (marker.onClick) {
        content.addEventListener("click", marker.onClick);
    }
    return content;
}

function createLeafletMarker(marker: Marker): LeafletMarker {
    const leafletMarker = new LeafletMarker(
        { lat: marker.latitude, lng: marker.longitude },
        {
            icon: createMarkerIcon(marker),
            interactive: !!marker.title || !!marker.onClick,
            title: marker.title
        }
    );

    if (marker.title) {
        leafletMarker.bindPopup(createPopupContent(marker));
    } else if (marker.onClick) {
        leafletMarker.on("click", marker.onClick);
    }

    return leafletMarker;
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
        optionDrag: dragging
    } = props;

    const mapNodeRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<LeafletMapInstance | undefined>(undefined);
    const tileLayerRef = useRef<TileLayer | undefined>(undefined);
    const markersRef = useRef<LeafletMarker[]>([]);

    // Create the map instance once on mount. Like react-leaflet's MapContainer,
    // these options are immutable for the lifetime of the component.
    useEffect(() => {
        if (!mapNodeRef.current) {
            return;
        }

        const map = new LeafletMapInstance(mapNodeRef.current, {
            attributionControl,
            center,
            dragging,
            maxZoom: 18,
            minZoom: 1,
            scrollWheelZoom,
            zoom: autoZoom ? translateZoom("city") : zoom,
            zoomControl
        });

        mapRef.current = map;

        return () => {
            mapRef.current = undefined;
            tileLayerRef.current = undefined;
            markersRef.current = [];
            map.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keep the base tile layer in sync with the map provider and token.
    useEffect(() => {
        const map = mapRef.current;
        if (!map) {
            return;
        }

        const { url, ...options } = baseMapLayer(mapProvider, mapsToken);
        const tileLayer = new TileLayer(url, options);

        tileLayerRef.current?.remove();
        tileLayerRef.current = tileLayer;
        tileLayer.addTo(map);
    }, [mapProvider, mapsToken]);

    // Sync markers and viewport with the resolved locations.
    useEffect(() => {
        const map = mapRef.current;
        if (!map) {
            return;
        }

        const markers = locations.concat(currentLocation ? [currentLocation] : []).filter(m => !!m);

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = markers.map(marker => {
            const leafletMarker = createLeafletMarker(marker);
            leafletMarker.addTo(map);
            return leafletMarker;
        });

        const bounds = latLngBounds(markers.map(m => [m.latitude, m.longitude]));

        if (bounds.isValid()) {
            if (autoZoom) {
                map.flyToBounds(bounds, { padding: [0.5, 0.5], animate: false }).invalidateSize();
            } else {
                map.panTo(bounds.getCenter(), { animate: false });
            }
        }
    }, [locations, currentLocation, autoZoom]);

    return (
        <div className={classNames("widget-maps", className)} style={{ ...style, ...getDimensions(props) }}>
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
