import { TileLayerProps } from "react-leaflet";
import { MapProviderEnum } from "../../typings/MapsProps";

const customUrls = {
    openStreetMap: "https://{s}.tile.osm.org/{z}/{x}/{y}.png",
    mapbox: "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}",
    hereMaps: "https://2.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8"
};

const mapAttr = {
    openStreetMapAttr: "&copy; <a href='https://osm.org/copyright'>OpenStreetMap</a> contributors",
    mapboxAttr:
        "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
    hereMapsAttr: "Map &copy; 1987-2020 <a href='https://developer.here.com'>HERE</a>"
};

export function baseMapLayer(mapProvider: MapProviderEnum, mapsToken?: string): TileLayerProps {
    let url;
    let attribution;
    let apiKey = "";

    if (mapProvider === "mapBox") {
        if (mapsToken) {
            apiKey = `?access_token=${mapsToken}`;
        }
        url = customUrls.mapbox + apiKey;
        attribution = mapAttr.mapboxAttr;
        return {
            url,
            attribution,
            id: "mapbox/satellite-streets-v12",
            tileSize: 512,
            zoomOffset: -1,
            maxNativeZoom: 20 // Mapbox supports higher native zoom
        };
    } else if (mapProvider === "hereMaps") {
        if (mapsToken && mapsToken.indexOf(",") > 0) {
            const splitToken = mapsToken.split(",");
            apiKey = `?app_id=${splitToken[0]}&app_code=${splitToken[1]}`;
        } else if (mapsToken) {
            apiKey = `?apiKey=${mapsToken}`;
        }
        url = customUrls.hereMaps + apiKey;
        attribution = mapAttr.hereMapsAttr;
        return {
            attribution,
            url,
            maxNativeZoom: 18 // HERE Maps conservative approach
        };
    } else {
        // OpenStreetMap (default)
        url = customUrls.openStreetMap;
        attribution = mapAttr.openStreetMapAttr;
        return {
            attribution,
            url,
            maxNativeZoom: 19 // OSM tiles available up to 19
        };
    }
}

/**
 * Get the maximum zoom level for a specific map provider
 */
export function getMaxZoomForProvider(mapProvider: MapProviderEnum): number {
    switch (mapProvider) {
        case "openStreet":
            return 22; // OSM with tile scaling beyond zoom 19
        case "mapBox":
            return 22; // Mapbox with good native support
        case "hereMaps":
            return 20; // HERE Maps conservative limit
        case "googleMaps":
            return 22; // Google Maps for consistency (handled elsewhere)
        default:
            return 18; // Safe fallback
    }
}
