import { when } from "mobx";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/main";
import { MapsContainerProps } from "../../../../typings/MapsProps";
import { mapsConfig } from "../../configs/Maps.config";
import { MapsContainer } from "../../containers/Maps.container";
import { RootContainer } from "../../containers/Root.container";
import { CORE_TOKENS as CORE, MAPS_TOKENS as MAPS, GeocodeFunction, GetLocationFunction } from "../../tokens";
import { CurrentLocationService } from "../CurrentLocation.service";
import { LocationResolverService } from "../LocationResolver.service";

export interface TestContainerOptions {
    props: MapsContainerProps;
    geocodeFunction?: GeocodeFunction;
    getLocationFunction?: GetLocationFunction;
}

/**
 * Creates a test container with injectable mocks.
 * Builds container manually to allow overriding dependencies before initialization.
 */
export function createTestContainer(
    options: TestContainerOptions
): [MapsContainer, LocationResolverService, GateProvider<MapsContainerProps>] {
    const { props, geocodeFunction, getLocationFunction } = options;

    // Create root container
    const root = new RootContainer();

    // Override geocode function in root if provided
    if (geocodeFunction) {
        root.bind(CORE.geocodeFunction).toConstant(geocodeFunction);
    }

    // Override current location function in root if provided
    if (getLocationFunction) {
        root.bind(CORE.getLocationFunction).toConstant(getLocationFunction);
    }

    // Create config and gate provider
    const config = mapsConfig(props);
    const gateProvider = new GateProvider<MapsContainerProps>(props);

    // Create and initialize Maps container
    const container = new MapsContainer(root).init({
        props,
        config,
        mainGate: gateProvider.gate
    });

    // Trigger setup lifecycle (in production this is done by useSetup hook)
    container.get(CORE.setupService).setup();

    // Get service (already initialized by postInit)
    const service = container.get(MAPS.locationResolver);

    return [container, service, gateProvider];
}

/**
 * Helper to wait for locations to be populated
 */
export async function waitForLocations(service: LocationResolverService, expectedLength: number): Promise<void> {
    return when(() => service.locations.length === expectedLength, { timeout: 2000 });
}

/**
 * Creates a mock geocode function for testing
 */
export function createMockGeocodeFunction(): jest.MockedFunction<GeocodeFunction> {
    return jest.fn().mockResolvedValue([]);
}

/**
 * Resolves the CurrentLocationService from a test container.
 */
export function getCurrentLocationService(container: MapsContainer): CurrentLocationService {
    return container.get(MAPS.currentLocation);
}
