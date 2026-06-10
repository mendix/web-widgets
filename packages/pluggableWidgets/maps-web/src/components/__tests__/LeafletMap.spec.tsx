import "@testing-library/jest-dom";
import { fireEvent, render, RenderResult } from "@testing-library/react";
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

    it("renders the leaflet container with the right structure", () => {
        const { container } = renderLeafletMap({ heightUnit: "percentageOfWidth", widthUnit: "pixels" });

        const widget = container.querySelector(".widget-maps");
        expect(widget).toBeInTheDocument();
        expect(widget!.querySelector(".widget-leaflet-maps-wrapper")).toBeInTheDocument();
        expect(widget!.querySelector(".widget-leaflet-maps")).toHaveClass("leaflet-container");
    });

    it("applies dimensions based on width and height units", () => {
        const { container } = renderLeafletMap({ heightUnit: "pixels", widthUnit: "pixels", height: 75, width: 50 });

        expect(container.querySelector(".widget-maps")).toHaveStyle({ width: "50px", height: "75px" });
    });

    it("applies a custom class name", () => {
        const { container } = renderLeafletMap({ className: "my-custom-class" });

        expect(container.querySelector(".widget-maps")).toHaveClass("my-custom-class");
    });

    it("renders without attribution by default", () => {
        const { container } = renderLeafletMap();

        expect(container.querySelector(".leaflet-control-attribution")).not.toBeInTheDocument();
    });

    it("renders with attribution when enabled", () => {
        const { container } = renderLeafletMap({ attributionControl: true });

        expect(container.querySelector(".leaflet-control-attribution")).toBeInTheDocument();
    });

    it("renders with zoom control", () => {
        const { container } = renderLeafletMap({ optionZoomControl: true });

        expect(container.querySelector(".leaflet-control-zoom")).toBeInTheDocument();
    });

    it("renders without zoom control when disabled", () => {
        const { container } = renderLeafletMap({ optionZoomControl: false });

        expect(container.querySelector(".leaflet-control-zoom")).not.toBeInTheDocument();
    });

    it("renders markers for each location", () => {
        const { container } = renderLeafletMap({
            locations: [
                {
                    title: "Mendix HQ",
                    latitude: 51.906688,
                    longitude: 4.48837,
                    url: "image:url"
                },
                {
                    title: "Gemeente Rotterdam",
                    latitude: 51.922823,
                    longitude: 4.479632,
                    url: "image:url"
                }
            ]
        });

        expect(container.querySelectorAll(".custom-leaflet-map-icon-marker")).toHaveLength(2);
    });

    it("renders the default marker icon when no custom marker image is set", () => {
        const { container } = renderLeafletMap({
            locations: [{ latitude: 51.906688, longitude: 4.48837, url: "" }]
        });

        expect(container.querySelectorAll(".leaflet-marker-icon")).toHaveLength(1);
        expect(container.querySelector(".custom-leaflet-map-icon-marker")).not.toBeInTheDocument();
    });

    it("renders the current location as an additional marker", () => {
        const { container } = renderLeafletMap({
            showCurrentLocation: true,
            currentLocation: {
                latitude: 51.906688,
                longitude: 4.48837,
                url: "image:url"
            }
        });

        expect(container.querySelectorAll(".custom-leaflet-map-icon-marker")).toHaveLength(1);
    });

    it("updates markers when locations change", () => {
        const { container, rerender } = renderLeafletMap({
            locations: [{ latitude: 51.906688, longitude: 4.48837, url: "image:url" }]
        });

        expect(container.querySelectorAll(".custom-leaflet-map-icon-marker")).toHaveLength(1);

        rerender(
            <LeafletMap
                {...defaultProps}
                locations={[
                    { latitude: 51.906688, longitude: 4.48837, url: "image:url" },
                    { latitude: 51.922823, longitude: 4.479632, url: "image:url" }
                ]}
            />
        );

        expect(container.querySelectorAll(".custom-leaflet-map-icon-marker")).toHaveLength(2);
    });

    it("opens a popup with the marker title on marker click", () => {
        const { container } = renderLeafletMap({
            autoZoom: false,
            locations: [{ title: "Mendix HQ", latitude: 51.906688, longitude: 4.48837, url: "image:url" }]
        });

        const marker = container.querySelector(".custom-leaflet-map-icon-marker");
        expect(marker).toBeInTheDocument();
        fireEvent.click(marker!);

        expect(container.querySelector(".leaflet-popup-content")).toHaveTextContent("Mendix HQ");
    });

    it("calls onClick when a marker without title is clicked", () => {
        const onClick = jest.fn();
        const { container } = renderLeafletMap({
            autoZoom: false,
            locations: [{ latitude: 51.906688, longitude: 4.48837, url: "image:url", onClick }]
        });

        fireEvent.click(container.querySelector(".custom-leaflet-map-icon-marker")!);

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("calls onClick when the popup content of a titled marker is clicked", () => {
        const onClick = jest.fn();
        const { container } = renderLeafletMap({
            autoZoom: false,
            locations: [{ title: "Mendix HQ", latitude: 51.906688, longitude: 4.48837, url: "image:url", onClick }]
        });

        fireEvent.click(container.querySelector(".custom-leaflet-map-icon-marker")!);
        const popupContent = container.querySelector(".leaflet-popup-content span");
        expect(popupContent).toBeInTheDocument();
        fireEvent.click(popupContent!);

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("removes the map on unmount", () => {
        const { container, unmount } = renderLeafletMap();

        expect(container.querySelector(".leaflet-container")).toBeInTheDocument();
        unmount();
        expect(container.querySelector(".leaflet-container")).not.toBeInTheDocument();
    });
});
