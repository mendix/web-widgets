import { latLngBounds, Map as LeafletMapInstance, Marker as LeafletMarker, TileLayer } from "leaflet";
import { reaction } from "mobx";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { MapProviderEnum, MapsContainerProps } from "../../../typings/MapsProps";
import { Marker } from "../../../typings/shared";
import { baseMapLayer } from "../../utils/leaflet";
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
        private readonly currentLocationService: CurrentLocationService
    ) {}

    get mapProvider(): MapProviderEnum {
        return this.gate.props.mapProvider;
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

        const { url, ...options } = baseMapLayer(
            mapProvider,
            this.gate.props.apiKeyExp?.value ?? this.gate.props.apiKey
        );
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
