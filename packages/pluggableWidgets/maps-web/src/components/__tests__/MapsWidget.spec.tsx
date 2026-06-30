import "@testing-library/jest-dom";
import { act, render } from "@testing-library/react";
import { DynamicValue } from "mendix";
import Maps from "../../Maps";
import { mockContainerProps } from "../../utils/mock-container-props";

describe("MapsWidget render gating", () => {
    it("renders map immediately for openStreet when apiKey is null", async () => {
        const { container } = render(
            <Maps {...mockContainerProps({ mapProvider: "openStreet", apiKey: "", apiKeyExp: undefined })} />
        );

        expect(container.querySelector(".leaflet-container")).toBeInTheDocument();
        await act(async () => Promise.resolve());
    });

    it("does NOT render MapSwitcher when apiKey is null for googleMaps", async () => {
        const { container } = render(
            <Maps {...mockContainerProps({ mapProvider: "googleMaps", apiKey: "", apiKeyExp: undefined })} />
        );

        expect(container.querySelector(".widget-maps")).toBeInTheDocument();
        expect(container.querySelector(".leaflet-container")).not.toBeInTheDocument();
        await act(async () => Promise.resolve());
    });

    it("renders MapSwitcher when apiKey resolves for googleMaps", async () => {
        const { container } = render(
            <Maps
                {...mockContainerProps({
                    mapProvider: "googleMaps",
                    apiKey: "",
                    apiKeyExp: { value: "my-key" } as DynamicValue<string>
                })}
            />
        );

        expect(container.querySelector(".widget-maps")).toBeInTheDocument();
        await act(async () => Promise.resolve());
    });

    it("does NOT render MapSwitcher when apiKey is null for mapBox", async () => {
        const { container } = render(
            <Maps {...mockContainerProps({ mapProvider: "mapBox", apiKey: "", apiKeyExp: undefined })} />
        );

        expect(container.querySelector(".widget-maps")).toBeInTheDocument();
        expect(container.querySelector(".leaflet-container")).not.toBeInTheDocument();
        await act(async () => Promise.resolve());
    });

    it("does NOT render MapSwitcher when apiKey is null for hereMaps", async () => {
        const { container } = render(
            <Maps {...mockContainerProps({ mapProvider: "hereMaps", apiKey: "", apiKeyExp: undefined })} />
        );

        expect(container.querySelector(".widget-maps")).toBeInTheDocument();
        expect(container.querySelector(".leaflet-container")).not.toBeInTheDocument();
        await act(async () => Promise.resolve());
    });

    it("passes mapsToken to MapSwitcher when key is available", async () => {
        const { container } = render(
            <Maps
                {...mockContainerProps({
                    mapProvider: "openStreet",
                    apiKey: "",
                    apiKeyExp: { value: "token-123" } as DynamicValue<string>
                })}
            />
        );

        expect(container.querySelector(".leaflet-container")).toBeInTheDocument();
        await act(async () => Promise.resolve());
    });
});
