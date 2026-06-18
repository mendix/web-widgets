import { TileLayerOptions } from "leaflet";
import { MapProviderEnum } from "../../typings/MapsProps";

export interface TileLayerConfig {
    url: string;
    options: TileLayerOptions;
}

const urls = {
    openStreetMap: "https://{s}.tile.osm.org/{z}/{x}/{y}.png",
    mapbox: "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}",
    hereMaps: "https://2.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8"
};

const attributions = {
    openStreetMap: "&copy; <a href='https://osm.org/copyright'>OpenStreetMap</a> contributors",
    mapbox: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
    hereMaps: "Map &copy; 1987-2020 <a href='https://developer.here.com'>HERE</a>"
};

export function getTileLayerConfig(mapProvider: MapProviderEnum, apiKey: string | null): TileLayerConfig {
    if (mapProvider === "mapBox") {
        const token = apiKey ? `?access_token=${apiKey}` : "";
        return {
            url: urls.mapbox + token,
            options: {
                attribution: attributions.mapbox,
                id: "mapbox/streets-v11",
                tileSize: 512,
                zoomOffset: -1
            }
        };
    }

    if (mapProvider === "hereMaps") {
        let token = "";
        if (apiKey) {
            if (apiKey.indexOf(",") > 0) {
                const [appId, appCode] = apiKey.split(",");
                token = `?app_id=${appId}&app_code=${appCode}`;
            } else {
                token = `?apiKey=${apiKey}`;
            }
        }
        return {
            url: urls.hereMaps + token,
            options: { attribution: attributions.hereMaps }
        };
    }

    return {
        url: urls.openStreetMap,
        options: { attribution: attributions.openStreetMap }
    };
}
