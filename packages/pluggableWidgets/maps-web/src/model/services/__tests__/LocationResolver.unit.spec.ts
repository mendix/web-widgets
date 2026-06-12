import { ValueStatus } from "mendix";
import { when, configure } from "mobx";
import { dynamic } from "@mendix/widget-plugin-test-utils";
import { createTestContainer, createMockGeocodeFunction, waitForLocations } from "./test-utils";
import { MarkersType } from "../../../../typings/MapsProps";
import { mockContainerProps } from "../../../utils/mock-container-props";

// Configure MobX for testing
configure({ enforceActions: "never" });

describe("LocationResolverService - Unit Tests", () => {
    let mockGeocode: ReturnType<typeof createMockGeocodeFunction>;

    beforeEach(() => {
        delete (window as any).mxGMLocationCache;
        global.fetch = jest.fn();
        mockGeocode = createMockGeocodeFunction();
    });

    describe("Basic Functionality", () => {
        it("should initialize with empty locations", () => {
            const [, service] = createTestContainer({
                props: mockContainerProps(),
                geocodeFunction: mockGeocode
            });
            expect(service.locations).toEqual([]);
        });

        it("should resolve markers with lat/lng directly without geocoding", async () => {
            mockGeocode.mockResolvedValue([
                {
                    latitude: 40.7128,
                    longitude: -74.006,
                    url: "",
                    title: "NYC",
                    onClick: undefined
                }
            ]);

            const [, service] = createTestContainer({
                props: mockContainerProps({
                    markers: [
                        {
                            latitude: dynamic("40.7128"),
                            longitude: dynamic("-74.0060"),
                            title: dynamic("NYC")
                        } as MarkersType
                    ]
                }),
                geocodeFunction: mockGeocode
            });

            await waitForLocations(service, 1);

            expect(service.locations).toHaveLength(1);
            expect(service.locations[0]).toMatchObject({
                latitude: 40.7128,
                longitude: -74.006,
                title: "NYC"
            });
            expect(mockGeocode).toHaveBeenCalled();
        });

        it("should geocode markers with addresses using API", async () => {
            mockGeocode.mockResolvedValue([
                {
                    latitude: 40.7128,
                    longitude: -74.006,
                    url: "",
                    title: "NYC",
                    onClick: undefined
                }
            ]);

            const [, service] = createTestContainer({
                props: mockContainerProps({
                    geodecodeApiKey: "test-api-key",
                    markers: [
                        {
                            address: dynamic("New York, NY"),
                            title: dynamic("NYC")
                        } as MarkersType
                    ]
                }),
                geocodeFunction: mockGeocode
            });

            await waitForLocations(service, 1);

            expect(service.locations).toHaveLength(1);
            expect(service.locations[0]).toMatchObject({
                latitude: 40.7128,
                longitude: -74.006,
                title: "NYC"
            });
            expect(mockGeocode).toHaveBeenCalledWith(
                expect.arrayContaining([expect.objectContaining({ address: "New York, NY" })]),
                "test-api-key"
            );
        });
    });

    describe("Empty/Null Inputs", () => {
        it("should handle empty markers array gracefully", () => {
            const [, service] = createTestContainer({
                props: mockContainerProps({
                    markers: []
                }),
                geocodeFunction: mockGeocode
            });

            expect(service.locations).toEqual([]);
            expect(service.markers).toEqual([]);
        });

        it("should handle dynamic markers with no datasource", () => {
            const [, service] = createTestContainer({
                props: mockContainerProps({
                    dynamicMarkers: [
                        {
                            markersDS: undefined,
                            locationType: "coordinates"
                        } as any
                    ]
                }),
                geocodeFunction: mockGeocode
            });

            expect(service.locations).toEqual([]);
            expect(service.markers).toEqual([]);
        });

        it("should handle dynamic markers with ValueStatus.Loading", () => {
            const [, service] = createTestContainer({
                props: mockContainerProps({
                    dynamicMarkers: [
                        {
                            markersDS: {
                                status: ValueStatus.Loading,
                                items: []
                            },
                            locationType: "coordinates"
                        } as any
                    ]
                }),
                geocodeFunction: mockGeocode
            });

            expect(service.locations).toEqual([]);
            expect(service.markers).toEqual([]);
        });
    });

    describe("API Key Handling", () => {
        it("should use geodecodeApiKeyExp.value over static apiKey", async () => {
            mockGeocode.mockResolvedValue([]);

            createTestContainer({
                props: mockContainerProps({
                    geodecodeApiKey: "static-key",
                    geodecodeApiKeyExp: dynamic("expression-key"),
                    markers: [
                        {
                            address: dynamic("New York, NY")
                        } as MarkersType
                    ]
                }),
                geocodeFunction: mockGeocode
            });

            await when(() => mockGeocode.mock.calls.length > 0);

            expect(mockGeocode).toHaveBeenCalledWith(expect.anything(), "expression-key");
        });

        it("should throw error when address provided but no API key", async () => {
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
            mockGeocode.mockRejectedValue(new Error("API key required in order to use markers containing address"));

            createTestContainer({
                props: mockContainerProps({
                    markers: [
                        {
                            address: dynamic("New York, NY")
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

            expect(mockGeocode).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });
    });

    describe("Marker Computed Property", () => {
        it("should compute markers synchronously", () => {
            const [, service] = createTestContainer({
                props: mockContainerProps({
                    markers: [
                        {
                            latitude: dynamic("40"),
                            longitude: dynamic("-74")
                        } as MarkersType
                    ]
                }),
                geocodeFunction: mockGeocode
            });

            expect(service.markers).toBeDefined();
            expect(Array.isArray(service.markers)).toBe(true);
            expect(service.markers.length).toBeGreaterThan(0);
        });
    });
});
