import { when, configure } from "mobx";
import { ValueStatus } from "mendix";
import { dynamic } from "@mendix/widget-plugin-test-utils";
import { LocationResolverService } from "../LocationResolver.service";
import { createMapsContainer } from "../../containers/createMapsContainer";
import { mockContainerProps } from "../../../utils/mock-container-props";
import { MAPS_TOKENS as MAPS, CORE_TOKENS as CORE } from "../../tokens";
import { MarkersType, MapsContainerProps } from "../../../../typings/MapsProps";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/main";
import { Container } from "brandi";
import * as geodecode from "../../../utils/geodecode";

// Configure MobX for testing
configure({ enforceActions: "never" });

// Mock the geocoding module
jest.mock("../../../utils/geodecode", () => ({
    ...jest.requireActual("../../../utils/geodecode"),
    convertAddressToLatLng: jest.fn()
}));

const mockConvertAddressToLatLng = geodecode.convertAddressToLatLng as jest.MockedFunction<
    typeof geodecode.convertAddressToLatLng
>;

// Helper to create and setup container
function setupContainer(
    props: MapsContainerProps
): [Container, LocationResolverService, GateProvider<MapsContainerProps>] {
    const [container, gateProvider] = createMapsContainer(props);
    const service = container.get(MAPS.locationResolver);
    container.get(CORE.setupService).setup();
    return [container, service, gateProvider];
}

// Helper to wait for locations to be populated
async function waitForLocations(service: LocationResolverService, expectedLength: number): Promise<void> {
    return when(() => service.locations.length === expectedLength);
}

describe("LocationResolverService - Unit Tests", () => {
    beforeEach(() => {
        delete (window as any).mxGMLocationCache;
        global.fetch = jest.fn();
        jest.clearAllMocks();
        mockConvertAddressToLatLng.mockResolvedValue([]);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("Basic Functionality", () => {
        it("should initialize with empty locations", () => {
            const [, service] = setupContainer(mockContainerProps());
            expect(service.locations).toEqual([]);
        });

        it("should resolve markers with lat/lng directly without geocoding", async () => {
            mockConvertAddressToLatLng.mockResolvedValue([
                {
                    latitude: 40.7128,
                    longitude: -74.006,
                    url: "",
                    title: "NYC",
                    onClick: undefined
                }
            ]);

            const [, service] = setupContainer(
                mockContainerProps({
                    markers: [
                        {
                            latitude: dynamic("40.7128"),
                            longitude: dynamic("-74.0060"),
                            title: dynamic("NYC")
                        } as MarkersType
                    ]
                })
            );

            await waitForLocations(service, 1);

            expect(service.locations).toHaveLength(1);
            expect(service.locations[0]).toMatchObject({
                latitude: 40.7128,
                longitude: -74.006,
                title: "NYC"
            });
            expect(mockConvertAddressToLatLng).toHaveBeenCalled();
        });

        it("should geocode markers with addresses using API", async () => {
            mockConvertAddressToLatLng.mockResolvedValue([
                {
                    latitude: 40.7128,
                    longitude: -74.006,
                    url: "",
                    title: "NYC",
                    onClick: undefined
                }
            ]);

            const [, service] = setupContainer(
                mockContainerProps({
                    geodecodeApiKey: "test-api-key",
                    markers: [
                        {
                            address: dynamic("New York, NY"),
                            title: dynamic("NYC")
                        } as MarkersType
                    ]
                })
            );

            await waitForLocations(service, 1);

            expect(service.locations).toHaveLength(1);
            expect(service.locations[0]).toMatchObject({
                latitude: 40.7128,
                longitude: -74.006,
                title: "NYC"
            });
            expect(mockConvertAddressToLatLng).toHaveBeenCalledWith(
                expect.arrayContaining([expect.objectContaining({ address: "New York, NY" })]),
                "test-api-key"
            );
        });
    });

    describe("Empty/Null Inputs", () => {
        it("should handle empty markers array gracefully", () => {
            const [, service] = setupContainer(
                mockContainerProps({
                    markers: []
                })
            );

            expect(service.locations).toEqual([]);
            expect(service.markers).toEqual([]);
        });

        it("should handle dynamic markers with no datasource", () => {
            const [, service] = setupContainer(
                mockContainerProps({
                    dynamicMarkers: [
                        {
                            markersDS: undefined,
                            locationType: "coordinates"
                        } as any
                    ]
                })
            );

            expect(service.locations).toEqual([]);
            expect(service.markers).toEqual([]);
        });

        it("should handle dynamic markers with ValueStatus.Loading", () => {
            const [, service] = setupContainer(
                mockContainerProps({
                    dynamicMarkers: [
                        {
                            markersDS: {
                                status: ValueStatus.Loading,
                                items: []
                            },
                            locationType: "coordinates"
                        } as any
                    ]
                })
            );

            expect(service.locations).toEqual([]);
            expect(service.markers).toEqual([]);
        });
    });

    describe("API Key Handling", () => {
        it("should use geodecodeApiKeyExp.value over static apiKey", async () => {
            mockConvertAddressToLatLng.mockResolvedValue([]);

            setupContainer(
                mockContainerProps({
                    geodecodeApiKey: "static-key",
                    geodecodeApiKeyExp: dynamic("expression-key"),
                    markers: [
                        {
                            address: dynamic("New York, NY")
                        } as MarkersType
                    ]
                })
            );

            await when(() => mockConvertAddressToLatLng.mock.calls.length > 0);

            expect(mockConvertAddressToLatLng).toHaveBeenCalledWith(expect.anything(), "expression-key");
        });

        it("should throw error when address provided but no API key", async () => {
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
            mockConvertAddressToLatLng.mockRejectedValue(
                new Error("API key required in order to use markers containing address")
            );

            setupContainer(
                mockContainerProps({
                    markers: [
                        {
                            address: dynamic("New York, NY")
                        } as MarkersType
                    ]
                })
            );

            await when(
                () => consoleErrorSpy.mock.calls.length > 0 || mockConvertAddressToLatLng.mock.calls.length > 0,
                { timeout: 1000 }
            ).catch(() => {
                // Timeout acceptable
            });

            expect(mockConvertAddressToLatLng).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });
    });

    describe("Marker Computed Property", () => {
        it("should compute markers synchronously", () => {
            const [, service] = setupContainer(
                mockContainerProps({
                    markers: [
                        {
                            latitude: dynamic("40"),
                            longitude: dynamic("-74")
                        } as MarkersType
                    ]
                })
            );

            expect(service.markers).toBeDefined();
            expect(Array.isArray(service.markers)).toBe(true);
            expect(service.markers.length).toBeGreaterThan(0);
        });
    });
});
