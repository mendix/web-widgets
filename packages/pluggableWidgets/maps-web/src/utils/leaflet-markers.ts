import { DivIcon, Icon as LeafletIcon, Marker as LeafletMarker } from "leaflet";
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";
import { Marker } from "../../typings/shared";

const defaultMarkerIcon = new LeafletIcon({
    iconRetinaUrl: markerIconUrl,
    iconUrl: markerIconUrl,
    shadowUrl: markerShadowUrl,
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

export function createLeafletMarker(marker: Marker): LeafletMarker {
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
