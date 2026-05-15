import { reaction, when, configure } from "mobx";
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

describe("LocationResolverService - Reactivity Tests", () => {
    beforeEach(() => {
        delete (window as any).mxGMLocationCache;
        global.fetch = jest.fn();
        jest.clearAllMocks();
        mockConvertAddressToLatLng.mockResolvedValue([]);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("MobX Reactivity", () => {
        it("should recompute when props.markers change", async () => {
            mockConvertAddressToLatLng
                .mockResolvedValueOnce([{ latitude: 40, longitude: -74, url: "", title: "", onClick: undefined }])
                .mockResolvedValueOnce([
                    { latitude: 40, longitude: -74, url: "", title: "", onClick: undefined },
                    { latitude: 41, longitude: -75, url: "", title: "", onClick: undefined },
                    { latitude: 42, longitude: -76, url: "", title: "", onClick: undefined }
                ]);

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
            mockConvertAddressToLatLng.mockResolvedValue([
                { latitude: 40, longitude: -74, url: "", title: "", onClick: undefined }
            ]);

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

            await waitForLocations(service, 1);

            // Should have triggered at least once
            expect(reactionCount).toBeGreaterThan(0);

            dispose();
        });

        it("should track mainGate.props as MobX dependency", async () => {
            mockConvertAddressToLatLng.mockResolvedValue([
                { latitude: 40, longitude: -74, url: "", title: "", onClick: undefined }
            ]);

            const [, service, gateProvider] = setupContainer(
                mockContainerProps({
                    markers: [
                        {
                            latitude: dynamic("40"),
                            longitude: dynamic("-74")
                        } as MarkersType
                    ]
                })
            );

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
            mockConvertAddressToLatLng.mockResolvedValue([
                { latitude: 40, longitude: -74, url: "", title: "", onClick: undefined }
            ]);

            const markers = [
                {
                    latitude: dynamic("40"),
                    longitude: dynamic("-74"),
                    title: dynamic("Test")
                } as MarkersType
            ];

            const [, service, gateProvider] = setupContainer(mockContainerProps({ markers }));

            await waitForLocations(service, 1);

            const callCountAfterInit = mockConvertAddressToLatLng.mock.calls.length;

            // Set props with identical markers
            gateProvider.setProps(mockContainerProps({ markers }));

            // Give time for any potential reaction
            await new Promise(resolve => setTimeout(resolve, 50));

            // Should not have called geocoding again
            expect(mockConvertAddressToLatLng.mock.calls.length).toBe(callCountAfterInit);
        });

        it("should handle rapid props changes gracefully", async () => {
            mockConvertAddressToLatLng.mockResolvedValue([
                { latitude: 40, longitude: -74, url: "", title: "", onClick: undefined }
            ]);

            const [, service, gateProvider] = setupContainer(mockContainerProps({ markers: [] }));

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
            expect(mockConvertAddressToLatLng).toHaveBeenCalled();
        });
    });
});
