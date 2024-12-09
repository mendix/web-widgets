import { MapProviderEnum } from "../../typings/MapsProps";

const mapAttr = {
    openStreetMapAttr: "&copy; <a href='https://osm.org/copyright'>OpenStreetMap</a> contributors",
    mapboxAttr:
        "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
    hereMapsAttr: "Map &copy; 1987-2020 <a href='https://developer.here.com'>HERE</a>"
};

const getCommonRasterSource = (urls: string[], attribution: string) => ({
    type: "raster" as const,
    tiles: urls,
    tileSize: 256,
    attribution,
    pixelRatio: window.devicePixelRatio > 1 ? 2 : 1
});

const createStyle = (source: ReturnType<typeof getCommonRasterSource>) => ({
    version: 8 as const,
    sources: { main: source },
    layers: [
        {
            id: "main",
            type: "raster" as const,
            source: "main",
            minzoom: 0,
            maxzoom: 18
        }
    ]
});

export function getMapStyle(mapProvider: MapProviderEnum, token?: string): any {
    switch (mapProvider) {
        case "openStreet":
            return createStyle(
                getCommonRasterSource(["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], mapAttr.openStreetMapAttr)
            );
        case "mapBox":
            if (!token) {
                throw new Error("Mapbox token is required");
            }
            return createStyle(
                getCommonRasterSource(
                    [`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${token}`],
                    mapAttr.mapboxAttr
                )
            );
        case "hereMaps":
            if (!token) {
                throw new Error("HERE Maps credentials are required");
            }
            const [appId, _appCode] = token.includes(",") ? token.split(",") : [token, ""];
            const baseUrl = "https://2.base.maps.ls.hereapi.com/maptile/2.1";
            return createStyle(
                getCommonRasterSource(
                    [`${baseUrl}/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?apiKey=${appId}`],
                    mapAttr.hereMapsAttr
                )
            );
        default:
            return createStyle(
                getCommonRasterSource(["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], mapAttr.openStreetMapAttr)
            );
    }
}
