import { createElement, ReactElement, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import {
    AdvancedMarker,
    APIProvider,
    InfoWindow,
    Map as GoogleMapComponent,
    MapProps,
    Pin,
    useAdvancedMarkerRef,
    useApiIsLoaded,
    useMap
} from "@vis.gl/react-google-maps";
import { Marker, SharedProps } from "../../typings/shared";
import { translateZoom } from "../utils/zoom";
import { getDimensions } from "@mendix/widget-plugin-platform/utils/get-dimensions";

export interface GoogleMapsProps extends SharedProps {
    mapId: string;
    streetViewControl: boolean;
    mapTypeControl: boolean;
    fullscreenControl: boolean;
    rotateControl: boolean;
}

export function GoogleMapContainer(props: GoogleMapsProps): ReactElement {
    return (
        <APIProvider apiKey={props.mapsToken ?? ""}>
            <GoogleMap {...props} />
        </APIProvider>
    );
}

function GoogleMap(props: GoogleMapsProps): ReactElement {
    const map = useMap();
    const isLoaded = useApiIsLoaded();
    const center = useRef<google.maps.LatLngLiteral>({
        lat: 51.906688,
        lng: 4.48837
    });
    const {
        autoZoom,
        className,
        currentLocation,
        fullscreenControl,
        locations,
        mapTypeControl,
        optionZoomControl: zoomControl,
        optionScroll: scrollwheel,
        optionDrag: draggable,
        rotateControl,
        streetViewControl,
        style,
        zoomLevel
    } = props;

    useEffect(() => {
        if (map) {
            const bounds = new google.maps.LatLngBounds();
            locations
                .concat(currentLocation ? [currentLocation] : [])
                .filter(m => !!m)
                .forEach(marker => {
                    bounds.extend({
                        lat: marker.latitude,
                        lng: marker.longitude
                    });
                });
            if (bounds.isEmpty()) {
                bounds.extend(center.current);
            }
            if (autoZoom) {
                map.fitBounds(bounds);
            } else {
                map.setCenter(bounds.getCenter());
            }
        }
    }, [map, locations, currentLocation, autoZoom]);

    const mapOptions: MapProps = {
        className: "widget-google-maps",
        defaultCenter: center.current,
        defaultZoom: autoZoom ? translateZoom("city") : zoomLevel,
        fullscreenControl,
        gestureHandling: draggable ? "auto" : "none",
        mapId: props.mapId,
        mapTypeControl,
        maxZoom: 20,
        minZoom: 1,
        rotateControl,
        scrollwheel,
        streetViewControl,
        zoomControl
    };

    return (
        <div className={classNames("widget-maps", className)} style={{ ...style, ...getDimensions(props) }}>
            <div className="widget-google-maps-wrapper">
                {isLoaded ? (
                    <GoogleMapComponent {...mapOptions}>
                        {locations
                            .concat(currentLocation ? [currentLocation] : [])
                            .filter(m => !!m)
                            .map((marker, index) => (
                                <GoogleMapsMarker key={`marker_${index}`} {...marker} />
                            ))}
                    </GoogleMapComponent>
                ) : (
                    <div className="spinner" />
                )}
            </div>
        </div>
    );
}

function GoogleMapsMarker(marker: Marker): ReactElement {
    const [markerRef, googleMarker] = useAdvancedMarkerRef();
    const [infowindowShown, setInfowindowShown] = useState(false);

    const toggleInfoWindow = (): void => setInfowindowShown(previousState => !previousState);
    const closeInfoWindow = (): void => setInfowindowShown(false);

    return (
        <AdvancedMarker
            position={{
                lat: marker.latitude,
                lng: marker.longitude
            }}
            title={marker.title}
            ref={markerRef}
            onClick={() => {
                if (marker.title) {
                    toggleInfoWindow();
                }

                if (marker.onClick) {
                    marker.onClick();
                }
            }}
        >
            {infowindowShown && (
                <InfoWindow anchor={googleMarker} onCloseClick={closeInfoWindow}>
                    <span style={{ cursor: marker.onClick ? "pointer" : "none" }} onClick={marker.onClick}>
                        {marker.title}
                    </span>
                </InfoWindow>
            )}
            {marker.url && <img src={marker.url} />}
            {!marker.url && <Pin />}
        </AdvancedMarker>
    );
}
