import "@testing-library/jest-dom";
import {
    AdvancedMarkerElement,
    initialize,
    InfoWindow,
    Map as GoogleMapMock,
    mockInstances,
    PinElement
} from "@googlemaps/jest-mocks";
import { act, render, RenderResult } from "@testing-library/react";
import { Marker } from "../../../typings/shared";
import { GoogleMapContainer, GoogleMapsProps } from "../GoogleMap";

/**
 * Builds a marker. The default `url` is an empty string because that is what
 * `convertAddressToLatLng` produces for markers without a custom marker, which
 * routes the marker through the <Pin /> branch of GoogleMap. Pass a `url` to
 * take the <img /> branch instead.
 */
function createMarker(overrides: Partial<Marker> = {}): Marker {
    return {
        latitude: 51.906688,
        longitude: 4.48837,
        title: "Mendix HQ",
        url: "",
        ...overrides
    };
}

const defaultPinMarker = createMarker();

const imageMarker = createMarker({
    latitude: 51.922823,
    longitude: 4.479632,
    title: "Gemeente Rotterdam",
    url: "image:url"
});

describe("Google maps", () => {
    const defaultProps: GoogleMapsProps = {
        autoZoom: true,
        className: "",
        currentLocation: undefined,
        fullscreenControl: false,
        height: 75,
        heightUnit: "pixels",
        locations: [],
        mapsToken: "",
        mapId: "DEMO_MAP_ID",
        mapTypeControl: false,
        optionDrag: true,
        optionScroll: true,
        optionZoomControl: true,
        rotateControl: false,
        showCurrentLocation: false,
        streetViewControl: false,
        style: {},
        width: 50,
        widthUnit: "percentage",
        zoomLevel: 10
    };

    /**
     * Records reads of the deprecated `PinElement.element` property. The mocked
     * PinElement has no such property, so the getter returns undefined to stay
     * faithful to the mock while still observing access.
     */
    let elementGetterSpy: jest.Mock;
    let originalElementDescriptor: PropertyDescriptor | undefined;

    beforeEach(() => {
        initialize();

        // APIProvider reads google.maps.Settings once the API reports loaded,
        // and @googlemaps/jest-mocks does not provide it.
        (google.maps as unknown as { Settings: { getInstance: () => Partial<google.maps.Settings> } }).Settings = {
            getInstance: () => ({})
        };

        elementGetterSpy = jest.fn();
        originalElementDescriptor = Object.getOwnPropertyDescriptor(PinElement.prototype, "element");
        Object.defineProperty(PinElement.prototype, "element", {
            configurable: true,
            get() {
                elementGetterSpy();
                return undefined;
            }
        });
    });

    afterEach(() => {
        if (originalElementDescriptor) {
            Object.defineProperty(PinElement.prototype, "element", originalElementDescriptor);
        } else {
            delete (PinElement.prototype as unknown as Record<string, unknown>).element;
        }
        jest.clearAllMocks();
    });

    async function renderGoogleMap(props: Partial<GoogleMapsProps> = {}): Promise<RenderResult> {
        let result: RenderResult;
        await act(async () => {
            result = render(<GoogleMapContainer {...defaultProps} {...props} />);
        });
        return result!;
    }

    /**
     * Lets `useMapsLibrary("marker")` settle. Without this the <Pin /> component
     * renders nothing and every pin assertion would pass vacuously.
     */
    async function flushMapsLibrary(): Promise<void> {
        await act(async () => {
            await Promise.resolve();
        });
    }

    function renderedPins(): PinElement[] {
        return mockInstances.get(PinElement);
    }

    /**
     * Pins that ended up in the marker content. vis.gl constructs a fresh
     * PinElement on every render because its effect depends on the props object
     * identity, so the number of constructed instances tracks render count.
     * Only the pin actually attached to the marker is observable behaviour.
     */
    function attachedPins(): PinElement[] {
        return renderedPins().filter(pin => pin.parentElement !== null);
    }

    /**
     * Markers still on the map. vis.gl detaches a marker by setting `map` to
     * null on cleanup, so this skips instances left over from earlier renders.
     */
    function liveMarkers(): AdvancedMarkerElement[] {
        return mockInstances.get(AdvancedMarkerElement).filter(marker => Boolean(marker.map));
    }

    /**
     * The container vis.gl assigns to `marker.content` and portals children
     * into. It is a detached subtree, so marker markup never reaches the
     * document and cannot be found with DOM queries or `asFragment()`.
     */
    function markerContent(marker: AdvancedMarkerElement): HTMLElement | null {
        return marker.content instanceof HTMLElement ? marker.content : null;
    }

    function markerImages(): HTMLImageElement[] {
        return liveMarkers().flatMap(marker => Array.from(markerContent(marker)?.querySelectorAll("img") ?? []));
    }

    function infoWindowContent(): string {
        return mockInstances
            .get(InfoWindow)
            .flatMap(infoWindow => (infoWindow.setContent as jest.Mock).mock.calls)
            .map(([content]) => (content instanceof HTMLElement ? (content.textContent ?? "") : ""))
            .join("");
    }

    /**
     * Clicks a marker. AdvancedMarker listens for the native `gmp-click` DOM
     * event rather than a `google.maps.event` listener, so dispatching on the
     * marker element is what reaches the widget's onClick.
     */
    async function clickMarker(marker: AdvancedMarkerElement): Promise<void> {
        await act(async () => {
            marker.dispatchEvent(new CustomEvent("gmp-click"));
        });
    }

    it("renders a map with right structure", async () => {
        const { asFragment } = await renderGoogleMap({ heightUnit: "percentageOfWidth", widthUnit: "pixels" });
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders a map with pixels renders structure correctly", async () => {
        const { asFragment } = await renderGoogleMap({ heightUnit: "pixels", widthUnit: "pixels" });
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders a map with percentage of width and height units renders the structure correctly", async () => {
        const { asFragment } = await renderGoogleMap({ heightUnit: "percentageOfWidth", widthUnit: "percentage" });
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders a map with percentage of parent units renders the structure correctly", async () => {
        const { asFragment } = await renderGoogleMap({ heightUnit: "percentageOfParent", widthUnit: "percentage" });
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders a map with markers", async () => {
        const { asFragment } = await renderGoogleMap({
            locations: [createMarker({ url: "image:url" }), imageMarker]
        });
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders a map with current location", async () => {
        const { asFragment } = await renderGoogleMap({
            showCurrentLocation: true,
            currentLocation: createMarker({ url: "image:url", title: undefined })
        });
        expect(asFragment()).toMatchSnapshot();
    });

    describe("default pin markers", () => {
        it("attaches a pin for a marker without a custom image", async () => {
            await renderGoogleMap({ locations: [defaultPinMarker] });
            await flushMapsLibrary();

            expect(renderedPins().length).toBeGreaterThan(0);
            expect(attachedPins()).toHaveLength(1);
        });

        it("does not read the deprecated element property of PinElement", async () => {
            await renderGoogleMap({ locations: [defaultPinMarker] });
            await flushMapsLibrary();

            expect(elementGetterSpy).not.toHaveBeenCalled();
        });

        it("attaches a pin for the current location marker when it has no image", async () => {
            await renderGoogleMap({ showCurrentLocation: true, currentLocation: defaultPinMarker });
            await flushMapsLibrary();

            expect(attachedPins()).toHaveLength(1);
        });

        it("opens an info window with the marker title when a default pin is clicked", async () => {
            await renderGoogleMap({ locations: [defaultPinMarker] });
            await flushMapsLibrary();

            expect(mockInstances.get(InfoWindow)).toHaveLength(0);

            await clickMarker(liveMarkers()[0]);
            await flushMapsLibrary();

            expect(infoWindowContent()).toContain("Mendix HQ");
        });
    });

    describe("custom image markers", () => {
        it("renders an image and no pin for a marker with a custom image", async () => {
            await renderGoogleMap({ locations: [imageMarker] });
            await flushMapsLibrary();

            expect(markerImages().map(image => image.getAttribute("src"))).toEqual(["image:url"]);
            expect(renderedPins()).toHaveLength(0);
        });

        it("renders a pin for the default marker and an image for the custom marker", async () => {
            await renderGoogleMap({ locations: [defaultPinMarker, imageMarker] });
            await flushMapsLibrary();

            expect(attachedPins()).toHaveLength(1);
            expect(markerImages()).toHaveLength(1);
        });

        it("calls the marker onClick action when clicked", async () => {
            const onClick = jest.fn();
            await renderGoogleMap({ locations: [{ ...imageMarker, onClick }] });
            await flushMapsLibrary();

            await clickMarker(liveMarkers()[0]);

            expect(onClick).toHaveBeenCalledTimes(1);
        });
    });

    describe("map camera", () => {
        it("fits the bounds of all markers when autoZoom is on", async () => {
            await renderGoogleMap({ autoZoom: true, locations: [defaultPinMarker, imageMarker] });

            expect(mockInstances.get(GoogleMapMock)[0].fitBounds).toHaveBeenCalled();
        });

        it("centers on the marker bounds when autoZoom is off", async () => {
            await renderGoogleMap({ autoZoom: false, locations: [defaultPinMarker, imageMarker] });

            const map = mockInstances.get(GoogleMapMock)[0];
            expect(map.setCenter).toHaveBeenCalled();
            expect(map.fitBounds).not.toHaveBeenCalled();
        });
    });
});
