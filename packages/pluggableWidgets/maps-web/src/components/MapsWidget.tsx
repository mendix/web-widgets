import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { MapSwitcher } from "./MapSwitcher";
import { useCurrentLocation, useLocationResolver, useMainGate } from "../model/hooks/injection-hooks";
import { translateZoom } from "../utils/zoom";

/**
 * Observer component that bridges the MobX model layer and the map views.
 * Re-renders whenever resolved locations, the current location, or widget props change.
 */
export const MapsWidget = observer(function MapsWidget(): ReactElement {
    const { props } = useMainGate();
    const { locations } = useLocationResolver();
    const { location: currentLocation } = useCurrentLocation();

    return (
        <MapSwitcher
            attributionControl={props.attributionControl}
            autoZoom={props.zoom === "automatic"}
            className={props.class}
            currentLocation={currentLocation}
            fullscreenControl={props.fullScreenControl}
            height={props.height}
            heightUnit={props.heightUnit}
            locations={locations}
            mapsToken={props.apiKeyExp?.value ?? props.apiKey}
            mapId={props.googleMapId}
            mapProvider={props.mapProvider}
            mapTypeControl={props.mapTypeControl}
            optionDrag={props.optionDrag}
            optionScroll={props.optionScroll}
            optionZoomControl={props.optionZoomControl}
            rotateControl={props.rotateControl}
            showCurrentLocation={props.showCurrentLocation}
            streetViewControl={props.optionStreetView}
            style={props.style}
            width={props.width}
            widthUnit={props.widthUnit}
            zoomLevel={translateZoom(props.zoom)}
        />
    );
});
