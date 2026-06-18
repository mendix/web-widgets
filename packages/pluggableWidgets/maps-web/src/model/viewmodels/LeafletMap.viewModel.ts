import { latLngBounds, Map as LeafletMapInstance, Marker as LeafletMarker, TileLayer, TileLayerOptions } from "leaflet";
import { reaction } from "mobx";
import { ComputedAtom, DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { MapProviderEnum, MapsContainerProps } from "../../../typings/MapsProps";
import { Marker } from "../../../typings/shared";
import { createLeafletMarker } from "../../utils/leaflet-markers";
import { translateZoom } from "../../utils/zoom";
import { CurrentLocationService } from "../services/CurrentLocation.service";
import { LocationResolverService } from "../services/LocationResolver.service";

export class LeafletMapViewModel {
    private map: LeafletMapInstance | undefined = undefined;
    private tileLayer: TileLayer | undefined = undefined;
    private leafletMarkers: LeafletMarker[] = [];

    constructor(
        private readonly gate: DerivedPropsGate<MapsContainerProps>,
        private readonly locationResolver: LocationResolverService,
        private readonly currentLocationService: CurrentLocationService,
        private readonly apiKeyAtom: ComputedAtom<string | null>
    ) {}

    get mapProvider(): MapProviderEnum {
        return this.gate.props.mapProvider;
    }

    private getTileLayerConfig(
        mapProvider: MapProviderEnum,
        apiKey: string | null
    ): { url: string; options: TileLayerOptions } {
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

        if (mapProvider === "mapBox") {
            const token = apiKey ? `?access_token=${apiKey}` : "";
            return {
                url: customUrls.mapbox + token,
                options: {
                    attribution: mapAttr.mapboxAttr,
                    id: "mapbox/streets-v11",
                    tileSize: 512,
                    zoomOffset: -1
                }
            };
        } else if (mapProvider === "hereMaps") {
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
                url: customUrls.hereMaps + token,
                options: { attribution: mapAttr.hereMapsAttr }
            };
        } else {
            return {
                url: customUrls.openStreetMap,
                options: { attribution: mapAttr.openStreetMapAttr }
            };
        }
    }

    setupMap(node: HTMLDivElement): () => void {
        const {
            attributionControl,
            optionDrag: dragging,
            optionScroll: scrollWheelZoom,
            optionZoomControl: zoomControl,
            zoom,
            mapProvider
        } = this.gate.props;
        const autoZoom = zoom === "automatic";

        const map = new LeafletMapInstance(node, {
            attributionControl,
            center: { lat: 51.906688, lng: 4.48837 },
            dragging,
            maxZoom: 18,
            minZoom: 1,
            scrollWheelZoom,
            zoom: autoZoom ? translateZoom("city") : translateZoom(zoom),
            zoomControl
        });

        this.map = map;

        const { url, options } = this.getTileLayerConfig(mapProvider, this.apiKeyAtom.get());
        this.tileLayer = new TileLayer(url, options);
        this.tileLayer.addTo(map);

        const dispose = reaction(
            () => ({
                locations: this.locationResolver.locations,
                currentLocation: this.currentLocationService.location
            }),
            ({ locations, currentLocation }) => this.syncMarkers(locations, currentLocation, autoZoom),
            { fireImmediately: true }
        );

        return () => {
            dispose();
            this.leafletMarkers = [];
            this.tileLayer = undefined;
            this.map = undefined;
            map.remove();
        };
    }

    private syncMarkers(locations: Marker[], currentLocation: Marker | undefined, autoZoom: boolean): void {
        const map = this.map;
        if (!map) {
            return;
        }

        const markers = locations.concat(currentLocation ? [currentLocation] : []).filter(m => !!m);

        this.leafletMarkers.forEach(marker => marker.remove());
        this.leafletMarkers = markers.map(marker => {
            const leafletMarker = createLeafletMarker(marker);
            leafletMarker.addTo(map);
            return leafletMarker;
        });

        const bounds = latLngBounds(markers.map(m => [m.latitude, m.longitude]));

        if (bounds.isValid()) {
            if (autoZoom) {
                map.flyToBounds(bounds, { padding: [0.5, 0.5], animate: false }).invalidateSize();
            } else {
                map.panTo(bounds.getCenter(), { animate: false });
            }
        }
    }
}
