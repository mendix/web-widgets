import { token } from "brandi";
import { ComputedAtom, DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { MapsConfig } from "./configs/Maps.config";
import { CurrentLocationService } from "./services/CurrentLocation.service";
import { LocationResolverService } from "./services/LocationResolver.service";
import { MapsSetupService } from "./services/MapsSetup.service";
import { MapsContainerProps } from "../../typings/MapsProps";
import { Marker, ModeledMarker } from "../../typings/shared";

/** Function type for geocoding markers. */
export type GeocodeFunction = (locations?: ModeledMarker[], mapToken?: string) => Promise<Marker[]>;

/** Function type for resolving the current user location. */
export type GetLocationFunction = () => Promise<Marker>;

/** Tokens to resolve dependencies from the container. */

const label = (name: string): string => `Maps[${name}]`;

/** Core tokens shared across containers. */
export const CORE_TOKENS = {
    mainGate: token<DerivedPropsGate<MapsContainerProps>>(label("mainGate")),
    config: token<MapsConfig>(label("config")),
    apiKey: token<ComputedAtom<string | null>>(label("apiKey")),
    geodecodeApiKey: token<ComputedAtom<string | null>>(label("geodecodeApiKey")),
    setupService: token<MapsSetupService>(label("setupService")),
    geocodeFunction: token<GeocodeFunction>(label("geocodeFunction")),
    getLocationFunction: token<GetLocationFunction>(label("getLocationFunction"))
};

/** Maps-specific tokens. */
export const MAPS_TOKENS = {
    locationResolver: token<LocationResolverService>(label("locationResolver")),
    currentLocation: token<CurrentLocationService>(label("currentLocation"))
};
