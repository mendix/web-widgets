import { render } from "@testing-library/react";
import Maps from "../Maps";
import { mockContainerProps } from "../utils/mock-container-props";

// Mock the MapSwitcher component since we're testing integration, not rendering
jest.mock("../components/MapSwitcher", () => ({
    MapSwitcher: ({ locations }: any) => <div data-testid="map-switcher">Locations: {locations.length}</div>
}));

// Mock location utils
jest.mock("../utils/location", () => ({
    getCurrentUserLocation: jest.fn().mockResolvedValue({ latitude: 0, longitude: 0 })
}));

describe("Maps Integration with Container", () => {
    it("should render Maps.tsx with ContainerProvider", () => {
        const props = mockContainerProps();
        const { container } = render(<Maps {...props} />);

        // Component should render without errors
        expect(container).toBeTruthy();
        // MapSwitcher should be rendered
        const mapSwitcher = container.querySelector('[data-testid="map-switcher"]');
        expect(mapSwitcher).not.toBeNull();
    });

    it("should pass resolved locations to MapSwitcher", () => {
        const props = mockContainerProps();
        const { getByTestId } = render(<Maps {...props} />);

        const mapSwitcher = getByTestId("map-switcher");
        // Should receive locations prop (empty array in this case)
        expect(mapSwitcher.textContent).toContain("Locations: 0");
    });
});
