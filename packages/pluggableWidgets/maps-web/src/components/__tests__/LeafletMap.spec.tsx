import "@testing-library/jest-dom";
import { render, RenderResult } from "@testing-library/react";
import { LeafletMap, LeafletProps } from "../LeafletMap";

describe("Leaflet maps", () => {
    const defaultProps: LeafletProps = {
        attributionControl: false,
        autoZoom: true,
        className: "",
        currentLocation: undefined,
        height: 75,
        heightUnit: "pixels",
        locations: [],
        mapProvider: "openStreet",
        mapsToken: "",
        optionDrag: true,
        optionScroll: true,
        optionZoomControl: true,
        showCurrentLocation: false,
        style: {},
        width: 50,
        widthUnit: "percentage",
        zoomLevel: 10
    };

    function renderLeafletMap(props: Partial<LeafletProps> = {}): RenderResult {
        return render(<LeafletMap {...defaultProps} {...props} />);
    }

    it("renders a map with right structure", () => {
        const { asFragment } = renderLeafletMap({ heightUnit: "percentageOfWidth", widthUnit: "pixels" });
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders a map with pixels renders structure correctly", () => {
        const { asFragment } = renderLeafletMap({ heightUnit: "pixels", widthUnit: "pixels" });
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders a map with percentage of width and height units renders the structure correctly", () => {
        const { asFragment } = renderLeafletMap({ heightUnit: "percentageOfWidth", widthUnit: "percentage" });
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders a map with percentage of parent units renders the structure correctly", () => {
        const { asFragment } = renderLeafletMap({ heightUnit: "percentageOfParent", widthUnit: "percentage" });
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders a map with HERE maps as provider", () => {
        const { asFragment } = renderLeafletMap({ mapProvider: "hereMaps" });
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders a map with MapBox maps as provider", () => {
        const { asFragment } = renderLeafletMap({ mapProvider: "mapBox" });
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders a map with attribution", () => {
        const { asFragment } = renderLeafletMap({ attributionControl: true });
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders a map with markers", () => {
        const { asFragment } = renderLeafletMap({
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

    it("renders a map with current location", () => {
        const { asFragment } = renderLeafletMap({
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
