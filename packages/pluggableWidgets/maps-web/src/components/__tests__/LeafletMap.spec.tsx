import "@testing-library/jest-dom";
import { act, fireEvent, render, RenderResult, waitFor } from "@testing-library/react";
import { DynamicValue } from "mendix";
import { dynamic } from "@mendix/widget-plugin-test-utils";
import { MapsContainerProps, MarkersType } from "../../../typings/MapsProps";
import Maps from "../../Maps";
import { mockContainerProps } from "../../utils/mock-container-props";

function staticMarker(
    latitude: string,
    longitude: string,
    opts?: { title?: string; customMarker?: string; onClick?: () => void }
): MarkersType {
    return {
        locationType: "latlng",
        latitude: dynamic(latitude),
        longitude: dynamic(longitude),
        address: dynamic(""),
        title: dynamic(opts?.title ?? ""),
        markerStyle: opts?.customMarker ? "image" : "default",
        customMarker: opts?.customMarker ? ({ value: { uri: opts.customMarker } } as any) : undefined,
        onClick: opts?.onClick ? ({ canExecute: true, execute: opts.onClick } as any) : undefined
    } as unknown as MarkersType;
}

function renderMaps(overrides?: Partial<MapsContainerProps>): RenderResult {
    return render(
        <Maps
            {...mockContainerProps({
                mapProvider: "openStreet",
                apiKey: "",
                apiKeyExp: { value: "test-key" } as DynamicValue<string>,
                ...overrides
            })}
        />
    );
}

describe("Leaflet maps", () => {
    it("renders the leaflet container with the right structure", async () => {
        const { container } = renderMaps();

        const widget = container.querySelector(".widget-maps");
        expect(widget).toBeInTheDocument();
        expect(widget!.querySelector(".widget-leaflet-maps-wrapper")).toBeInTheDocument();
        expect(widget!.querySelector(".widget-leaflet-maps")).toHaveClass("leaflet-container");
        await act(async () => Promise.resolve());
    });

    it("applies dimensions based on width and height units", async () => {
        const { container } = renderMaps({ heightUnit: "pixels", widthUnit: "pixels", height: 75, width: 50 });

        expect(container.querySelector(".widget-maps")).toHaveStyle({ width: "50px", height: "75px" });
        await act(async () => Promise.resolve());
    });

    it("applies a custom class name", async () => {
        const { container } = renderMaps({ class: "my-custom-class" });

        expect(container.querySelector(".widget-maps")).toHaveClass("my-custom-class");
        await act(async () => Promise.resolve());
    });

    it("renders without attribution by default", async () => {
        const { container } = renderMaps({ attributionControl: false });

        expect(container.querySelector(".leaflet-control-attribution")).not.toBeInTheDocument();
        await act(async () => Promise.resolve());
    });

    it("renders with attribution when enabled", async () => {
        const { container } = renderMaps({ attributionControl: true });

        expect(container.querySelector(".leaflet-control-attribution")).toBeInTheDocument();
        await act(async () => Promise.resolve());
    });

    it("renders with zoom control", async () => {
        const { container } = renderMaps({ optionZoomControl: true });

        expect(container.querySelector(".leaflet-control-zoom")).toBeInTheDocument();
        await act(async () => Promise.resolve());
    });

    it("renders without zoom control when disabled", async () => {
        const { container } = renderMaps({ optionZoomControl: false });

        expect(container.querySelector(".leaflet-control-zoom")).not.toBeInTheDocument();
        await act(async () => Promise.resolve());
    });

    it("renders markers for each location", async () => {
        const { container } = renderMaps({
            markers: [
                staticMarker("51.906688", "4.48837", { customMarker: "image:url" }),
                staticMarker("51.922823", "4.479632", { customMarker: "image:url" })
            ]
        });

        await waitFor(() => {
            expect(container.querySelectorAll(".custom-leaflet-map-icon-marker")).toHaveLength(2);
        });
    });

    it("renders the default marker icon when no custom marker image is set", async () => {
        const { container } = renderMaps({
            markers: [staticMarker("51.906688", "4.48837")]
        });

        await waitFor(() => {
            expect(container.querySelectorAll(".leaflet-marker-icon")).toHaveLength(1);
        });
        expect(container.querySelector(".custom-leaflet-map-icon-marker")).not.toBeInTheDocument();
    });

    it("renders the current location as an additional marker", async () => {
        const { container } = renderMaps({
            showCurrentLocation: true,
            markers: [staticMarker("51.906688", "4.48837", { customMarker: "image:url" })]
        });

        await waitFor(() => {
            expect(container.querySelectorAll(".custom-leaflet-map-icon-marker").length).toBeGreaterThanOrEqual(1);
        });
    });

    it("opens a popup with the marker title on marker click", async () => {
        const { container } = renderMaps({
            zoom: "city",
            markers: [staticMarker("51.906688", "4.48837", { title: "Mendix HQ", customMarker: "image:url" })]
        });

        await waitFor(() => {
            expect(container.querySelector(".custom-leaflet-map-icon-marker")).toBeInTheDocument();
        });

        fireEvent.click(container.querySelector(".custom-leaflet-map-icon-marker")!);
        expect(container.querySelector(".leaflet-popup-content")).toHaveTextContent("Mendix HQ");
    });

    it("calls onClick when a marker without title is clicked", async () => {
        const onClick = jest.fn();
        const { container } = renderMaps({
            zoom: "city",
            markers: [staticMarker("51.906688", "4.48837", { customMarker: "image:url", onClick })]
        });

        await waitFor(() => {
            expect(container.querySelector(".custom-leaflet-map-icon-marker")).toBeInTheDocument();
        });

        fireEvent.click(container.querySelector(".custom-leaflet-map-icon-marker")!);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("calls onClick when the popup content of a titled marker is clicked", async () => {
        const onClick = jest.fn();
        const { container } = renderMaps({
            zoom: "city",
            markers: [staticMarker("51.906688", "4.48837", { title: "Mendix HQ", customMarker: "image:url", onClick })]
        });

        await waitFor(() => {
            expect(container.querySelector(".custom-leaflet-map-icon-marker")).toBeInTheDocument();
        });

        fireEvent.click(container.querySelector(".custom-leaflet-map-icon-marker")!);
        const popupContent = container.querySelector(".leaflet-popup-content span");
        expect(popupContent).toBeInTheDocument();
        fireEvent.click(popupContent!);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("removes the map on unmount", async () => {
        const { container, unmount } = renderMaps();

        expect(container.querySelector(".leaflet-container")).toBeInTheDocument();
        unmount();
        expect(container.querySelector(".leaflet-container")).not.toBeInTheDocument();
    });
});
