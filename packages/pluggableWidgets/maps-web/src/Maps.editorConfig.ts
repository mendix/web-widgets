import { hidePropertiesIn, hidePropertyIn, Problem, Properties } from "@mendix/pluggable-widgets-tools";
import { StructurePreviewProps } from "@mendix/widget-plugin-platform/preview/structure-preview-api";

import { MapsPreviewProps } from "../typings/MapsProps";

import GoogleMapsSVG from "./assets/GoogleMaps.svg";
import HereMapsSVG from "./assets/HereMaps.svg";
import MapboxSVG from "./assets/Mapbox.svg";
import OpenStreetMapSVG from "./assets/OpenStreetMap.svg";

export function getProperties(values: MapsPreviewProps, defaultProperties: Properties): Properties {
    const containsAddress =
        values.markers.some(marker => marker.locationType === "address") ||
        values.dynamicMarkers.some(marker => marker.locationType === "address");

    if (!values.apiKey) {
        hidePropertyIn(defaultProperties, values, "apiKey");
    }
    if (!values.geodecodeApiKey) {
        hidePropertyIn(defaultProperties, values, "geodecodeApiKey");
    }

    values.markers.forEach((f, index) => {
        if (f.locationType === "address") {
            hidePropertyIn(defaultProperties, values, "markers", index, "latitude");
            hidePropertyIn(defaultProperties, values, "markers", index, "longitude");
        } else {
            hidePropertyIn(defaultProperties, values, "markers", index, "address");
        }
        if (f.markerStyle === "default") {
            hidePropertyIn(defaultProperties, values, "markers", index, "customMarker");
        }
    });

    values.dynamicMarkers.forEach((f, index) => {
        if (f.locationType === "address") {
            hidePropertyIn(defaultProperties, values, "dynamicMarkers", index, "latitude");
            hidePropertyIn(defaultProperties, values, "dynamicMarkers", index, "longitude");
        } else {
            hidePropertyIn(defaultProperties, values, "dynamicMarkers", index, "address");
        }
        if (f.markerStyleDynamic === "default") {
            hidePropertyIn(defaultProperties, values, "dynamicMarkers", index, "customMarkerDynamic");
        }
    });

    if (values.mapProvider !== "googleMaps") {
        hidePropertiesIn(defaultProperties, values, [
            "optionStreetView",
            "mapTypeControl",
            "fullScreenControl",
            "rotateControl",
            "googleMapId"
        ]);
        if (values.mapProvider === "openStreet") {
            hidePropertiesIn(defaultProperties, values, ["apiKeyExp", "apiKey"]);
        }
    } else {
        hidePropertyIn(defaultProperties, values, "attributionControl");
    }

    if (!containsAddress) {
        hidePropertiesIn(defaultProperties, values, ["geodecodeApiKey", "geodecodeApiKeyExp"]);
    }

    return defaultProperties;
}

export function check(values: MapsPreviewProps): Problem[] {
    const errors: Problem[] = [];

    if (values.apiKey) {
        errors.push({
            property: "apiKey",
            severity: "warning",
            message: "Static API key is deprecated. Use the 'API Key' expression instead."
        });
    }

    if (values.geodecodeApiKey) {
        errors.push({
            property: "geodecodeApiKey",
            severity: "warning",
            message: "Static Geo location API key is deprecated. Use the 'Geo location API key' expression instead."
        });
    }

    const containsAddress =
        values.markers.some(marker => marker.locationType === "address") ||
        values.dynamicMarkers.some(marker => marker.locationType === "address");

    if (values.mapProvider !== "openStreet" && !values.apiKey && !values.apiKeyExp) {
        errors.push({
            property: "apiKey",
            message: "To avoid errors during map rendering it's necessary to include an Api Key",
            url: "https://docs.mendix.com/appstore/widgets/maps#1-2-limitations"
        });
    }

    if (containsAddress && !values.geodecodeApiKeyExp && !values.geodecodeApiKey) {
        errors.push({
            property: "geodecodeApiKey",
            message: "To translate addresses to latitude and longitude a Geo Location API key is required",
            url: "https://docs.mendix.com/appstore/widgets/maps#1-2-limitations"
        });
    }

    values.markers.forEach((marker, index) => {
        if (marker.locationType === "address") {
            if (!marker.address) {
                errors.push({
                    property: `markers/${index + 1}/address`,
                    message: "A static marker requires an address"
                });
            }
        } else {
            if (!marker.latitude) {
                errors.push({
                    property: `markers/${index + 1}/latitude`,
                    message: "A static marker requires latitude"
                });
            }
            if (!marker.longitude) {
                errors.push({
                    property: `markers/${index + 1}/longitude`,
                    message: "A static marker requires longitude"
                });
            }
        }
        if (marker.markerStyle === "image" && !marker.customMarker) {
            errors.push({
                property: `markers/${index + 1}/customMarker`,
                message: `Custom marker image is required when shape is 'image' for address ${marker.address}`
            });
        }
    });

    values.dynamicMarkers.forEach((marker, index) => {
        if (!marker.markersDS || ("type" in marker.markersDS && marker.markersDS.type === "null")) {
            errors.push({
                property: `dynamicMarkers/${index + 1}/markersDS`,
                message: "A data source should be selected in order to retrieve a list of markers"
            });
        } else {
            if (marker.locationType === "address") {
                if (!marker.address) {
                    errors.push({
                        property: `dynamicMarkers/${index + 1}/address`,
                        message: "A dynamic marker requires an address"
                    });
                }
            } else {
                if (!marker.latitude) {
                    errors.push({
                        property: `dynamicMarkers/${index + 1}/latitude`,
                        message: "A dynamic marker requires latitude"
                    });
                }
                if (!marker.longitude) {
                    errors.push({
                        property: `dynamicMarkers/${index + 1}/longitude`,
                        message: "A dynamic marker requires longitude"
                    });
                }
            }
        }
        if (marker.markerStyleDynamic === "image" && !marker.customMarkerDynamic) {
            errors.push({
                property: `dynamicMarkers/${index + 1}/customMarkerDynamic`,
                message: `Custom marker image is required when shape is 'image' for list at position ${index + 1}`
            });
        }
    });

    return errors;
}

export function getPreview(values: MapsPreviewProps): StructurePreviewProps {
    const { mapProvider } = values;
    let image: string;

    switch (mapProvider) {
        case "googleMaps":
            image = GoogleMapsSVG;
            break;
        case "mapBox":
            image = MapboxSVG;
            break;
        case "openStreet":
            image = OpenStreetMapSVG;
            break;
        case "hereMaps":
            image = HereMapsSVG;
            break;
    }

    return {
        type: "Image",
        document: decodeURIComponent(image.replace("data:image/svg+xml,", "")),
        width: 375,
        height: 375
    };
}
