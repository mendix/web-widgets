import { configure, when } from "mobx";
import { createTestContainer, getCurrentLocationService } from "./test-utils";
import { Marker } from "../../../../typings/shared";
import { mockContainerProps } from "../../../utils/mock-container-props";

configure({ enforceActions: "never" });

describe("CurrentLocationService", () => {
    const userLocation: Marker = { latitude: 52.370216, longitude: 4.895168, url: "image:current" };

    function mockGetLocation(location: Marker = userLocation): jest.Mock<Promise<Marker>> {
        return jest.fn().mockResolvedValue(location);
    }

    it("does not request location when showCurrentLocation is false", () => {
        const getLocation = mockGetLocation();
        const [container] = createTestContainer({
            props: mockContainerProps({ showCurrentLocation: false }),
            getLocationFunction: getLocation
        });
        getCurrentLocationService(container);

        expect(getLocation).not.toHaveBeenCalled();
    });

    it("resolves location when showCurrentLocation is true", async () => {
        const getLocation = mockGetLocation();
        const [container] = createTestContainer({
            props: mockContainerProps({ showCurrentLocation: true }),
            getLocationFunction: getLocation
        });
        const service = getCurrentLocationService(container);

        await when(() => service.location !== undefined, { timeout: 1000 });

        expect(getLocation).toHaveBeenCalledTimes(1);
        expect(service.location).toEqual(userLocation);
    });

    it("does not update location after dispose", async () => {
        let resolveLocation: (marker: Marker) => void = () => undefined;
        const getLocation = jest.fn().mockImplementation(
            () =>
                new Promise<Marker>(resolve => {
                    resolveLocation = resolve;
                })
        );
        const [container] = createTestContainer({
            props: mockContainerProps({ showCurrentLocation: true }),
            getLocationFunction: getLocation,
            skipSetup: true
        });
        const service = getCurrentLocationService(container);
        const dispose = service.setup();

        expect(getLocation).toHaveBeenCalledTimes(1);

        dispose();
        resolveLocation(userLocation);
        await Promise.resolve();

        expect(service.location).toBeUndefined();
    });

    it("logs an error when location resolution fails", async () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
        const error = new Error("Current user location is not available");
        const getLocation = jest.fn().mockRejectedValue(error);
        const [container] = createTestContainer({
            props: mockContainerProps({ showCurrentLocation: true }),
            getLocationFunction: getLocation
        });
        getCurrentLocationService(container);

        await new Promise(resolve => setTimeout(resolve, 0));

        expect(consoleSpy).toHaveBeenCalledWith(error);
        consoleSpy.mockRestore();
    });
});
