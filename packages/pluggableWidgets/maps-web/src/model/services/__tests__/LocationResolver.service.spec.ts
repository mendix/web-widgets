import { reaction } from "mobx";
import { ValueStatus } from "mendix";
import { dynamic } from "@mendix/widget-plugin-test-utils";
import { LocationResolverService } from "../LocationResolver.service";
import { createMapsContainer } from "../../containers/createMapsContainer";
import { mockContainerProps } from "../../../utils/mock-container-props";
import { MAPS_TOKENS as MAPS, CORE_TOKENS as CORE } from "../../tokens";
import { MarkersType, MapsContainerProps } from "../../../../typings/MapsProps";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/main";
import { Container } from "brandi";

// Helper to create and setup container
function setupContainer(
    props: MapsContainerProps
): [Container, LocationResolverService, GateProvider<MapsContainerProps>] {
    const [container, gateProvider] = createMapsContainer(props);
    const service = container.get(MAPS.locationResolver);
    // Trigger setup lifecycle to start reactions
    container.get(CORE.setupService).setup();
    return [container, service, gateProvider];
}

describe("LocationResolverService", () => {
    beforeEach(() => {
        // Clear geocoding cache
        delete (window as any).mxGMLocationCache;
        global.fetch = jest.fn();
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

            // Wait for reaction to fire
            await new Promise(resolve => setTimeout(resolve, 10));

            expect(service.locations).toHaveLength(1);
            expect(service.locations[0]).toMatchObject({
                latitude: 40.7128,
                longitude: -74.006,
                title: "NYC"
            });
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it("should geocode markers with addresses using API", async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                json: async () => ({
                    results: [{ geometry: { location: { lat: 40.7128, lng: -74.006 } } }]
                })
            });

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

            // Wait for async geocoding
            await new Promise(resolve => setTimeout(resolve, 50));

            expect(service.locations).toHaveLength(1);
            expect(service.locations[0]).toMatchObject({
                latitude: 40.7128,
                longitude: -74.006,
                title: "NYC"
            });
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining("https://maps.googleapis.com/maps/api/geocode/json")
            );
        });
    });

    describe("Mixed Markers", () => {
        it("should handle mixed markers (coordinates + addresses)", async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                json: async () => ({
                    results: [{ geometry: { location: { lat: 42.3601, lng: -71.0589 } } }]
                })
            });

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

            await new Promise(resolve => setTimeout(resolve, 50));

            expect(service.locations).toHaveLength(2);
            expect(service.locations[0].title).toBe("NYC");
            expect(service.locations[1].title).toBe("Boston");
        });
    });

    describe("Empty/Null Inputs", () => {
        it("should handle empty markers array gracefully", async () => {
            const [, service] = setupContainer(
                mockContainerProps({
                    markers: []
                })
            );

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(service.locations).toEqual([]);
        });

        it("should handle dynamic markers with no datasource", async () => {
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

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(service.locations).toEqual([]);
        });

        it("should handle dynamic markers with ValueStatus.Loading", async () => {
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

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(service.locations).toEqual([]);
        });
    });

    describe("API Key Handling", () => {
        it("should use geodecodeApiKeyExp.value over static apiKey", async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                json: async () => ({
                    results: [{ geometry: { location: { lat: 40.7128, lng: -74.006 } } }]
                })
            });

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

            await new Promise(resolve => setTimeout(resolve, 50));

            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("key=expression-key"));
        });

        it("should throw error when address provided but no API key", async () => {
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

            setupContainer(
                mockContainerProps({
                    markers: [
                        {
                            address: dynamic("New York, NY")
                        } as MarkersType
                    ]
                })
            );

            await new Promise(resolve => setTimeout(resolve, 50));

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining("Failed to resolve marker locations"),
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });
    });

    describe("Caching", () => {
        it("should cache geocoding results and reuse them", async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                json: async () => ({
                    results: [{ geometry: { location: { lat: 40.7128, lng: -74.006 } } }]
                })
            });

            const props = mockContainerProps({
                geodecodeApiKey: "test-key",
                markers: [
                    {
                        address: dynamic("New York, NY")
                    } as MarkersType
                ]
            });

            // First container
            setupContainer(props);
            await new Promise(resolve => setTimeout(resolve, 50));

            expect(global.fetch).toHaveBeenCalledTimes(1);

            // Second container with same address
            setupContainer(props);
            await new Promise(resolve => setTimeout(resolve, 50));

            // Should still be 1 call (cache hit)
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it("should handle multiple identical addresses in single request", async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                json: async () => ({
                    results: [{ geometry: { location: { lat: 40.7128, lng: -74.006 } } }]
                })
            });

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

            await new Promise(resolve => setTimeout(resolve, 50));

            expect(service.locations).toHaveLength(3);
            expect(global.fetch).toHaveBeenCalledTimes(1); // Only 1 API call
        });
    });

    describe("Error Handling", () => {
        it("should handle geocoding failures gracefully", async () => {
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Geocoding failed"));

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

            await new Promise(resolve => setTimeout(resolve, 50));

            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(service.locations).toEqual([]); // Failed marker excluded

            consoleErrorSpy.mockRestore();
        });

        it("should continue processing when some geocoding fails", async () => {
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({
                    json: async () => ({
                        results: [{ geometry: { location: { lat: 40.7128, lng: -74.006 } } }]
                    })
                })
                .mockRejectedValueOnce(new Error("Failed"))
                .mockResolvedValueOnce({
                    json: async () => ({
                        results: [{ geometry: { location: { lat: 42.3601, lng: -71.0589 } } }]
                    })
                });

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

            await new Promise(resolve => setTimeout(resolve, 100));

            // Should have 2 markers (1 failed)
            expect(service.locations.length).toBeGreaterThanOrEqual(2);

            consoleErrorSpy.mockRestore();
        });
    });

    describe("MobX Reactivity", () => {
        it("should recompute when props.markers change", async () => {
            const [, service, gateProvider] = setupContainer(
                mockContainerProps({
                    markers: [
                        {
                            latitude: dynamic("40.7128"),
                            longitude: dynamic("-74.0060")
                        } as MarkersType
                    ]
                })
            );

            await new Promise(resolve => setTimeout(resolve, 10));
            expect(service.locations).toHaveLength(1);

            // Change markers via gate
            gateProvider.setProps(
                mockContainerProps({
                    markers: [
                        { latitude: dynamic("40"), longitude: dynamic("-74") } as MarkersType,
                        { latitude: dynamic("41"), longitude: dynamic("-75") } as MarkersType,
                        { latitude: dynamic("42"), longitude: dynamic("-76") } as MarkersType
                    ]
                })
            );

            await new Promise(resolve => setTimeout(resolve, 10));
            expect(service.locations).toHaveLength(3);
        });

        it("should trigger reactions when locations update", async () => {
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

            let reactionCount = 0;
            const dispose = reaction(
                () => service.locations.length,
                () => {
                    reactionCount++;
                }
            );

            await new Promise(resolve => setTimeout(resolve, 20));

            // Should have triggered at least once
            expect(reactionCount).toBeGreaterThan(0);

            dispose();
        });
    });

    describe("Static + Dynamic Markers Integration", () => {
        it("should combine static and dynamic markers", async () => {
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

            await new Promise(resolve => setTimeout(resolve, 20));

            expect(service.locations).toHaveLength(2);
            expect(service.locations[0].title).toBe("Static");
            expect(service.locations[1].title).toBe("Dynamic");
        });

        it("should flatten multiple dynamic marker datasources", async () => {
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

            await new Promise(resolve => setTimeout(resolve, 20));

            // 2 items from first datasource + 1 from second = 3 total
            expect(service.locations).toHaveLength(3);
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

            // markers should be immediately accessible (synchronous computed)
            expect(service.markers).toBeDefined();
            expect(Array.isArray(service.markers)).toBe(true);
            expect(service.markers.length).toBeGreaterThan(0);
        });
    });

    describe("Action Preservation", () => {
        it("should preserve onClick action through conversion", async () => {
            const mockAction = jest.fn();
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

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(service.locations[0].onClick).toBe(mockAction);
        });
    });
});
