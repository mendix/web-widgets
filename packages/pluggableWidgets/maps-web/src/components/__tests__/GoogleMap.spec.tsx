import "@testing-library/jest-dom";
import { initialize } from "@googlemaps/jest-mocks";
import { act, render, RenderResult } from "@testing-library/react";
import { GoogleMapContainer, GoogleMapsProps } from "../GoogleMap";

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

    beforeEach(() => {
        initialize();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    async function renderGoogleMap(props: Partial<GoogleMapsProps> = {}): Promise<RenderResult> {
        let result: RenderResult;
        await act(async () => {
            result = render(<GoogleMapContainer {...defaultProps} {...props} />);
        });
        return result!;
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
            locations: [
                {
                    title: "Mendix HQ",
                    latitude: 51.906688,
                    longitude: 4.48837,
                    url: "image:url"
                },
                {
                    title: "Gementee Rotterdam",
                    latitude: 51.922823,
                    longitude: 4.479632,
                    url: "image:url"
                }
            ]
        });
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders a map with current location", async () => {
        const { asFragment } = await renderGoogleMap({
            showCurrentLocation: true,
            currentLocation: {
                latitude: 51.906688,
                longitude: 4.48837,
                url: "image:url"
            }
        });
        expect(asFragment()).toMatchSnapshot();
    });
});
