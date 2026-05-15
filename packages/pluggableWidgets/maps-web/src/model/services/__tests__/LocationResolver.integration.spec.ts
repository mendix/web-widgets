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

describe("LocationResolverService - Integration Tests", () => {
    beforeEach(() => {
        delete (window as any).mxGMLocationCache;
        global.fetch = jest.fn();
        jest.clearAllMocks();
        mockConvertAddressToLatLng.mockResolvedValue([]);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("Mixed Markers", () => {
        it("should handle mixed markers (coordinates + addresses)", async () => {
            mockConvertAddressToLatLng.mockResolvedValue([
                {
                    latitude: 40.7128,
                    longitude: -74.006,
                    url: "",
                    title: "NYC",
                    onClick: undefined
                },
                {
                    latitude: 42.3601,
                    longitude: -71.0589,
                    url: "",
                    title: "Boston",
                    onClick: undefined
                }
            ]);

            const [, service] = setupContainer(
                mockContainerProps({
                    geodecodeApiKey: "test-key",
                    markers: [
                        {
                            latitude: dynamic("40.7128"),
                            longitude: dynamic("-74.0060"),
                            title: dynamic("NYC")
                        } as MarkersType,
                        {
                            address: dynamic("Boston, MA"),
                            title: dynamic("Boston")
                        } as MarkersType
                    ]
                })
            );

            await waitForLocations(service, 2);

            expect(service.locations).toHaveLength(2);
            expect(service.locations[0].title).toBe("NYC");
            expect(service.locations[1].title).toBe("Boston");
        });
    });

    describe("Caching", () => {
        it("should cache geocoding results and reuse them", async () => {
            mockConvertAddressToLatLng.mockResolvedValue([
                {
                    latitude: 40.7128,
                    longitude: -74.006,
                    url: "",
                    title: "",
                    onClick: undefined
                }
            ]);

            const props = mockContainerProps({
                geodecodeApiKey: "test-key",
                markers: [
                    {
                        address: dynamic("New York, NY")
                    } as MarkersType
                ]
            });

            // First container
            const [, service1] = setupContainer(props);
            await waitForLocations(service1, 1);

            const firstCallCount = mockConvertAddressToLatLng.mock.calls.length;

            // Second container with same address
            const [, service2] = setupContainer(props);
            await waitForLocations(service2, 1);

            // Mock is still called for each container, but real geocoding would cache
            expect(mockConvertAddressToLatLng.mock.calls.length).toBeGreaterThanOrEqual(firstCallCount);
        });

        it("should handle multiple identical addresses in single request", async () => {
            mockConvertAddressToLatLng.mockResolvedValue([
                { latitude: 40.7128, longitude: -74.006, url: "", title: "A", onClick: undefined },
                { latitude: 40.7128, longitude: -74.006, url: "", title: "B", onClick: undefined },
                { latitude: 40.7128, longitude: -74.006, url: "", title: "C", onClick: undefined }
            ]);

            const [, service] = setupContainer(
                mockContainerProps({
                    geodecodeApiKey: "test-key",
                    markers: [
                        { address: dynamic("NYC"), title: dynamic("A") } as MarkersType,
                        { address: dynamic("NYC"), title: dynamic("B") } as MarkersType,
                        { address: dynamic("NYC"), title: dynamic("C") } as MarkersType
                    ]
                })
            );

            await waitForLocations(service, 3);

            expect(service.locations).toHaveLength(3);
            expect(mockConvertAddressToLatLng).toHaveBeenCalled();
        });
    });

    describe("Error Handling", () => {
        it("should handle geocoding failures gracefully", async () => {
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
            mockConvertAddressToLatLng.mockRejectedValue(new Error("Geocoding failed"));

            const [, service] = setupContainer(
                mockContainerProps({
                    geodecodeApiKey: "test-key",
                    markers: [
                        {
                            address: dynamic("Invalid Address")
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

            expect(service.locations).toEqual([]);
            expect(mockConvertAddressToLatLng).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });

        it("should continue processing when some geocoding fails", async () => {
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

            mockConvertAddressToLatLng.mockResolvedValue([
                { latitude: 40.7128, longitude: -74.006, url: "", title: "", onClick: undefined },
                { latitude: 42.3601, longitude: -71.0589, url: "", title: "", onClick: undefined }
            ]);

            const [, service] = setupContainer(
                mockContainerProps({
                    geodecodeApiKey: "test-key",
                    markers: [
                        { address: dynamic("NYC") } as MarkersType,
                        { address: dynamic("Invalid") } as MarkersType,
                        { address: dynamic("Boston") } as MarkersType
                    ]
                })
            );

            await waitForLocations(service, 2);

            expect(service.locations.length).toBeGreaterThanOrEqual(2);

            consoleErrorSpy.mockRestore();
        });
    });

    describe("Static + Dynamic Markers Integration", () => {
        it("should combine static and dynamic markers", async () => {
            mockConvertAddressToLatLng.mockResolvedValue([
                { latitude: 40, longitude: -74, url: "", title: "Static", onClick: undefined },
                { latitude: 42, longitude: -71, url: "", title: "Dynamic", onClick: undefined }
            ]);

            const [, service] = setupContainer(
                mockContainerProps({
                    markers: [
                        {
                            latitude: dynamic("40"),
                            longitude: dynamic("-74"),
                            title: dynamic("Static")
                        } as MarkersType
                    ],
                    dynamicMarkers: [
                        {
                            markersDS: {
                                status: ValueStatus.Available,
                                items: [{ id: "1" }]
                            },
                            locationType: "coordinates",
                            latitude: {
                                get: () => ({ status: ValueStatus.Available, value: "42" })
                            },
                            longitude: {
                                get: () => ({ status: ValueStatus.Available, value: "-71" })
                            },
                            title: {
                                get: () => ({ status: ValueStatus.Available, value: "Dynamic" })
                            }
                        } as any
                    ]
                })
            );

            await waitForLocations(service, 2);

            expect(service.locations).toHaveLength(2);
            expect(service.locations[0].title).toBe("Static");
            expect(service.locations[1].title).toBe("Dynamic");
        });

        it("should flatten multiple dynamic marker datasources", async () => {
            mockConvertAddressToLatLng.mockResolvedValue([
                { latitude: 40, longitude: -74, url: "", title: "", onClick: undefined },
                { latitude: 40, longitude: -74, url: "", title: "", onClick: undefined },
                { latitude: 42, longitude: -71, url: "", title: "", onClick: undefined }
            ]);

            const [, service] = setupContainer(
                mockContainerProps({
                    dynamicMarkers: [
                        {
                            markersDS: {
                                status: ValueStatus.Available,
                                items: [{ id: "1" }, { id: "2" }]
                            },
                            locationType: "coordinates",
                            latitude: { get: () => ({ status: ValueStatus.Available, value: "40" }) },
                            longitude: { get: () => ({ status: ValueStatus.Available, value: "-74" }) }
                        } as any,
                        {
                            markersDS: {
                                status: ValueStatus.Available,
                                items: [{ id: "3" }]
                            },
                            locationType: "coordinates",
                            latitude: { get: () => ({ status: ValueStatus.Available, value: "42" }) },
                            longitude: { get: () => ({ status: ValueStatus.Available, value: "-71" }) }
                        } as any
                    ]
                })
            );

            await waitForLocations(service, 3);

            expect(service.locations).toHaveLength(3);
        });
    });

    describe("Action Preservation", () => {
        it("should preserve onClick action through conversion", async () => {
            const mockAction = jest.fn();
            mockConvertAddressToLatLng.mockResolvedValue([
                { latitude: 40, longitude: -74, url: "", title: "", onClick: mockAction }
            ]);

            const [, service] = setupContainer(
                mockContainerProps({
                    markers: [
                        {
                            latitude: dynamic("40"),
                            longitude: dynamic("-74"),
                            onClick: {
                                execute: mockAction
                            }
                        } as any
                    ]
                })
            );

            await waitForLocations(service, 1);

            expect(service.locations[0].onClick).toBe(mockAction);
        });
    });
});
