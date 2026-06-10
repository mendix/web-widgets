import "@testing-library/jest-dom";
import { act, render, waitFor } from "@testing-library/react";
import { dynamic } from "@mendix/widget-plugin-test-utils";
import { MarkersType } from "../../typings/MapsProps";
import Maps from "../Maps";
import { mockContainerProps } from "../utils/mock-container-props";

describe("Maps", () => {
    function staticMarker(latitude: string, longitude: string): MarkersType {
        return {
            locationType: "latlng",
            latitude: dynamic(latitude),
            longitude: dynamic(longitude),
            address: dynamic(""),
            title: dynamic("Static marker"),
            markerStyle: "default",
            customMarker: undefined,
            onClick: undefined
        } as unknown as MarkersType;
    }

    it("renders the leaflet map through the container provider", async () => {
        const { container } = render(<Maps {...mockContainerProps({ mapProvider: "openStreet" })} />);

        expect(container.querySelector(".widget-maps")).toBeInTheDocument();
        expect(container.querySelector(".leaflet-container")).toBeInTheDocument();

        // Flush the initial (empty) geocode resolution to avoid act() warnings
        await act(async () => Promise.resolve());
    });

    it("passes resolved locations from the model layer to the map", async () => {
        const props = mockContainerProps({
            mapProvider: "openStreet",
            zoom: "city",
            markers: [staticMarker("51.906688", "4.48837")]
        });

        const { container } = render(<Maps {...props} />);

        await waitFor(() => {
            expect(container.querySelectorAll(".leaflet-marker-icon")).toHaveLength(1);
        });
    });
});
