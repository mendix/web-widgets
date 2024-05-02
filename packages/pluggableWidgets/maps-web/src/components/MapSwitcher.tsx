import { createElement, ReactElement } from "react";
import { GoogleMapContainer, GoogleMapsProps } from "./GoogleMap";
import { LeafletMap, LeafletProps } from "./LeafletMap";

interface SwitcherProps extends GoogleMapsProps, LeafletProps {}

export const MapSwitcher = (props: SwitcherProps): ReactElement => {
    return props.mapProvider === "googleMaps" ? <GoogleMapContainer {...props} /> : <LeafletMap {...props} />;
};
