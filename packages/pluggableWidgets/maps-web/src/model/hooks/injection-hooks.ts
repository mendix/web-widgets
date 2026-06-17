import { createInjectionHooks } from "brandi-react";
import { CORE_TOKENS as CORE, MAPS_TOKENS as MAPS } from "../tokens";

export const [useMainGate] = createInjectionHooks(CORE.mainGate);
export const [useMapsConfig] = createInjectionHooks(CORE.config);
export const [useApiKey] = createInjectionHooks(CORE.apiKey);

export const [useLocationResolver] = createInjectionHooks(MAPS.locationResolver);
export const [useCurrentLocation] = createInjectionHooks(MAPS.currentLocation);
