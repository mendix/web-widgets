import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { token } from "brandi";
import { MapsContainerProps } from "../../typings/MapsProps";
import { Marker, ModeledMarker } from "../../typings/shared";
import { MapsConfig } from "./configs/Maps.config";
import { MapsSetupService } from "./services/MapsSetup.service";
import { LocationResolverService } from "./services/LocationResolver.service";

/** Function type for geocoding markers. */
export type GeocodeFunction = (locations?: ModeledMarker[], mapToken?: string) => Promise<Marker[]>;

/** Tokens to resolve dependencies from the container. */

const label = (name: string): string => `Maps[${name}]`;

/** Core tokens shared across containers. */
export const CORE_TOKENS = {
    mainGate: token<DerivedPropsGate<MapsContainerProps>>(label("mainGate")),
    config: token<MapsConfig>(label("config")),
    setupService: token<MapsSetupService>(label("setupService")),
    geocodeFunction: token<GeocodeFunction>(label("geocodeFunction"))
};

/** Maps-specific tokens. */
export const MAPS_TOKENS = {
    locationResolver: token<LocationResolverService>(label("locationResolver"))
};
