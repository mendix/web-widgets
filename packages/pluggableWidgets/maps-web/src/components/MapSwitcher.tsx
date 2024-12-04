import { createElement, ReactElement } from "react";
import { GoogleMapContainer, GoogleMapsProps } from "./GoogleMap";
import { MapLibreComponent, MapLibreProps } from "./MapLibreComponent";

interface SwitcherProps extends GoogleMapsProps, MapLibreProps {}

export const MapSwitcher = (props: SwitcherProps): ReactElement => {
    return props.mapProvider === "googleMaps" ? <GoogleMapContainer {...props} /> : <MapLibreComponent {...props} />;
};
