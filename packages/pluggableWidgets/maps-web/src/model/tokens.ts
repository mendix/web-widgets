/** Tokens to resolve dependencies from the container. */

import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { token } from "brandi";
import { MapsContainerProps } from "../../typings/MapsProps";
import { MapsConfig } from "./configs/Maps.config";
import { MapsSetupService } from "./services/MapsSetup.service";
import { LocationResolverService } from "./services/LocationResolver.service";

const label = (name: string): string => `Maps[${name}]`;

/** Core tokens shared across containers. */
export const CORE_TOKENS = {
    mainGate: token<DerivedPropsGate<MapsContainerProps>>(label("mainGate")),
    config: token<MapsConfig>(label("config")),
    setupService: token<MapsSetupService>(label("setupService"))
};

/** Maps-specific tokens. */
export const MAPS_TOKENS = {
    locationResolver: token<LocationResolverService>(label("locationResolver"))
};
