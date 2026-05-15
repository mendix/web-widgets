import { reaction, when, configure } from "mobx";
import { dynamic } from "@mendix/widget-plugin-test-utils";
import { mockContainerProps } from "../../../utils/mock-container-props";
import { MarkersType } from "../../../../typings/MapsProps";
import { createTestContainer, createMockGeocodeFunction, waitForLocations } from "./test-utils";

// Configure MobX for testing
configure({ enforceActions: "never" });

describe("LocationResolverService - Reactivity Tests", () => {
    let mockGeocode: ReturnType<typeof createMockGeocodeFunction>;

    beforeEach(() => {
        delete (window as any).mxGMLocationCache;
        global.fetch = jest.fn();
        mockGeocode = createMockGeocodeFunction();
    });

    describe("MobX Reactivity", () => {
        it("should recompute when props.markers change", async () => {
            mockGeocode
                .mockResolvedValueOnce([{ latitude: 40, longitude: -74, url: "", title: "", onClick: undefined }])
                .mockResolvedValueOnce([
                    { latitude: 40, longitude: -74, url: "", title: "", onClick: undefined },
                    { latitude: 41, longitude: -75, url: "", title: "", onClick: undefined },
                    { latitude: 42, longitude: -76, url: "", title: "", onClick: undefined }
                ]);

            const [, service, gateProvider] = createTestContainer({
                props: mockContainerProps({
                    markers: [
                        {
                            latitude: dynamic("40.7128"),
                            longitude: dynamic("-74.0060")
                        } as MarkersType
                    ]
                }),
                geocodeFunction: mockGeocode
            });

            await waitForLocations(service, 1);
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

            await waitForLocations(service, 3);
            expect(service.locations).toHaveLength(3);
        });

        it("should trigger reactions when locations update", async () => {
            mockGeocode.mockResolvedValue([{ latitude: 40, longitude: -74, url: "", title: "", onClick: undefined }]);

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

            let reactionCount = 0;
            const dispose = reaction(
                () => service.locations.length,
                () => {
                    reactionCount++;
                }
            );

            await waitForLocations(service, 1);

            // Should have triggered at least once
            expect(reactionCount).toBeGreaterThan(0);

            dispose();
        });

        it("should track mainGate.props as MobX dependency", async () => {
            mockGeocode.mockResolvedValue([{ latitude: 40, longitude: -74, url: "", title: "", onClick: undefined }]);

            const [, service, gateProvider] = createTestContainer({
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

            await waitForLocations(service, 1);

            // Track marker computed changes
            let computedRunCount = 0;
            const dispose = reaction(
                () => service.markers.length,
                () => {
                    computedRunCount++;
                }
            );

            // Change props - should trigger marker recomputation
            gateProvider.setProps(
                mockContainerProps({
                    markers: [
                        { latitude: dynamic("40"), longitude: dynamic("-74") } as MarkersType,
                        { latitude: dynamic("41"), longitude: dynamic("-75") } as MarkersType
                    ]
                })
            );

            // Wait for reaction
            await when(() => computedRunCount > 0);

            expect(computedRunCount).toBeGreaterThan(0);

            dispose();
        });

        it("should not update locations if markers haven't changed", async () => {
            mockGeocode.mockResolvedValue([{ latitude: 40, longitude: -74, url: "", title: "", onClick: undefined }]);

            const markers = [
                {
                    latitude: dynamic("40"),
                    longitude: dynamic("-74"),
                    title: dynamic("Test")
                } as MarkersType
            ];

            const [, service, gateProvider] = createTestContainer({
                props: mockContainerProps({ markers }),
                geocodeFunction: mockGeocode
            });

            await waitForLocations(service, 1);

            const callCountAfterInit = mockGeocode.mock.calls.length;

            // Set props with identical markers
            gateProvider.setProps(mockContainerProps({ markers }));

            // Give time for any potential reaction
            await new Promise(resolve => setTimeout(resolve, 50));

            // Should not have called geocoding again
            expect(mockGeocode.mock.calls.length).toBe(callCountAfterInit);
        });

        it("should handle rapid props changes gracefully", async () => {
            mockGeocode.mockResolvedValue([{ latitude: 40, longitude: -74, url: "", title: "", onClick: undefined }]);

            const [, service, gateProvider] = createTestContainer({
                props: mockContainerProps({ markers: [] }),
                geocodeFunction: mockGeocode
            });

            // Rapid fire props changes
            for (let i = 0; i < 5; i++) {
                gateProvider.setProps(
                    mockContainerProps({
                        markers: [
                            {
                                latitude: dynamic(`${40 + i}`),
                                longitude: dynamic("-74")
                            } as MarkersType
                        ]
                    })
                );
            }

            // Wait for final state
            await waitForLocations(service, 1);

            // Should have processed all changes
            expect(service.locations).toHaveLength(1);
            expect(mockGeocode).toHaveBeenCalled();
        });
    });
});
