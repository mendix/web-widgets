import { DynamicValue } from "mendix";
import { MapsContainerProps } from "../../typings/MapsProps";

export function mockContainerProps(overrides?: Partial<MapsContainerProps>): MapsContainerProps {
    return {
        name: "maps1",
        class: "",
        style: {},
        tabIndex: 0,
        apiKey: "",
        apiKeyExp: { value: "test-api-key" } as DynamicValue<string>,
        geodecodeApiKey: "",
        geodecodeApiKeyExp: undefined,
        googleMapId: "",
        mapProvider: "googleMaps",
        mapTypeControl: false,
        fullScreenControl: false,
        rotateControl: false,
        attributionControl: true,
        optionDrag: true,
        optionScroll: true,
        optionZoomControl: true,
        optionStreetView: false,
        showCurrentLocation: false,
        zoom: "automatic",
        height: 500,
        heightUnit: "pixels",
        width: 100,
        widthUnit: "percentage",
        markers: [] as any,
        dynamicMarkers: [] as any,
        ...overrides
    };
}
