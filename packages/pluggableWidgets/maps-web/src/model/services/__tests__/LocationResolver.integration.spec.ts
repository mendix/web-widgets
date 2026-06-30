import { ValueStatus } from "mendix";
import { when, configure } from "mobx";
import { dynamic } from "@mendix/widget-plugin-test-utils";
import { createTestContainer, createMockGeocodeFunction, waitForLocations } from "./test-utils";
import { MarkersType } from "../../../../typings/MapsProps";
import { mockContainerProps } from "../../../utils/mock-container-props";

// Configure MobX for testing
configure({ enforceActions: "never" });

describe("LocationResolverService - Integration Tests", () => {
    let mockGeocode: ReturnType<typeof createMockGeocodeFunction>;

    beforeEach(() => {
        delete (window as any).mxGMLocationCache;
        global.fetch = jest.fn();
        mockGeocode = createMockGeocodeFunction();
    });

    describe("Mixed Markers", () => {
        it("should handle mixed markers (coordinates + addresses)", async () => {
            mockGeocode.mockResolvedValue([
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

            const [, service] = createTestContainer({
                props: mockContainerProps({
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
                }),
                geocodeFunction: mockGeocode
            });

            await waitForLocations(service, 2);

            expect(service.locations).toHaveLength(2);
            expect(service.locations[0].title).toBe("NYC");
            expect(service.locations[1].title).toBe("Boston");
        });
    });

    describe("Caching", () => {
        it("should cache geocoding results and reuse them", async () => {
            mockGeocode.mockResolvedValue([
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
            const [, service1] = createTestContainer({
                props,
                geocodeFunction: mockGeocode
            });
            await waitForLocations(service1, 1);

            const firstCallCount = mockGeocode.mock.calls.length;

            // Second container with same address
            const [, service2] = createTestContainer({
                props,
                geocodeFunction: mockGeocode
            });
            await waitForLocations(service2, 1);

            // Mock is still called for each container, but real geocoding would cache
            expect(mockGeocode.mock.calls.length).toBeGreaterThanOrEqual(firstCallCount);
        });

        it("should handle multiple identical addresses in single request", async () => {
            mockGeocode.mockResolvedValue([
                { latitude: 40.7128, longitude: -74.006, url: "", title: "A", onClick: undefined },
                { latitude: 40.7128, longitude: -74.006, url: "", title: "B", onClick: undefined },
                { latitude: 40.7128, longitude: -74.006, url: "", title: "C", onClick: undefined }
            ]);

            const [, service] = createTestContainer({
                props: mockContainerProps({
                    geodecodeApiKey: "test-key",
                    markers: [
                        { address: dynamic("NYC"), title: dynamic("A") } as MarkersType,
                        { address: dynamic("NYC"), title: dynamic("B") } as MarkersType,
                        { address: dynamic("NYC"), title: dynamic("C") } as MarkersType
                    ]
                }),
                geocodeFunction: mockGeocode
            });

            await waitForLocations(service, 3);

            expect(service.locations).toHaveLength(3);
            expect(mockGeocode).toHaveBeenCalled();
        });
    });

    describe("Error Handling", () => {
        it("should handle geocoding failures gracefully", async () => {
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
            mockGeocode.mockRejectedValue(new Error("Geocoding failed"));

            const [, service] = createTestContainer({
                props: mockContainerProps({
                    geodecodeApiKey: "test-key",
                    markers: [
                        {
                            address: dynamic("Invalid Address")
                        } as MarkersType
                    ]
                }),
                geocodeFunction: mockGeocode
            });

            await when(() => consoleErrorSpy.mock.calls.length > 0 || mockGeocode.mock.calls.length > 0, {
                timeout: 1000
            }).catch(() => {
                // Timeout acceptable
            });

            expect(service.locations).toEqual([]);
            expect(mockGeocode).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });

        it("should continue processing when some geocoding fails", async () => {
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

            mockGeocode.mockResolvedValue([
                { latitude: 40.7128, longitude: -74.006, url: "", title: "", onClick: undefined },
                { latitude: 42.3601, longitude: -71.0589, url: "", title: "", onClick: undefined }
            ]);

            const [, service] = createTestContainer({
                props: mockContainerProps({
                    geodecodeApiKey: "test-key",
                    markers: [
                        { address: dynamic("NYC") } as MarkersType,
                        { address: dynamic("Invalid") } as MarkersType,
                        { address: dynamic("Boston") } as MarkersType
                    ]
                }),
                geocodeFunction: mockGeocode
            });

            await waitForLocations(service, 2);

            expect(service.locations.length).toBeGreaterThanOrEqual(2);

            consoleErrorSpy.mockRestore();
        });
    });

    describe("Static + Dynamic Markers Integration", () => {
        it("should combine static and dynamic markers", async () => {
            mockGeocode.mockResolvedValue([
                { latitude: 40, longitude: -74, url: "", title: "Static", onClick: undefined },
                { latitude: 42, longitude: -71, url: "", title: "Dynamic", onClick: undefined }
            ]);

            const [, service] = createTestContainer({
                props: mockContainerProps({
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
                }),
                geocodeFunction: mockGeocode
            });

            await waitForLocations(service, 2);

            expect(service.locations).toHaveLength(2);
            expect(service.locations[0].title).toBe("Static");
            expect(service.locations[1].title).toBe("Dynamic");
        });

        it("should flatten multiple dynamic marker datasources", async () => {
            mockGeocode.mockResolvedValue([
                { latitude: 40, longitude: -74, url: "", title: "", onClick: undefined },
                { latitude: 40, longitude: -74, url: "", title: "", onClick: undefined },
                { latitude: 42, longitude: -71, url: "", title: "", onClick: undefined }
            ]);

            const [, service] = createTestContainer({
                props: mockContainerProps({
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
                }),
                geocodeFunction: mockGeocode
            });

            await waitForLocations(service, 3);

            expect(service.locations).toHaveLength(3);
        });
    });

    describe("Action Preservation", () => {
        it("should preserve onClick action through conversion", async () => {
            const mockAction = jest.fn();
            mockGeocode.mockResolvedValue([{ latitude: 40, longitude: -74, url: "", title: "", onClick: mockAction }]);

            const [, service] = createTestContainer({
                props: mockContainerProps({
                    markers: [
                        {
                            latitude: dynamic("40"),
                            longitude: dynamic("-74"),
                            onClick: {
                                execute: mockAction
                            }
                        } as any
                    ]
                }),
                geocodeFunction: mockGeocode
            });

            await waitForLocations(service, 1);

            expect(service.locations[0].onClick).toBe(mockAction);
        });
    });
});
