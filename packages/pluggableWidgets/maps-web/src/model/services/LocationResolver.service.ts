import deepEqual from "deep-equal";
import { action, computed, makeObservable, observable, reaction } from "mobx";
import {
    DerivedPropsGate,
    disposeBatch,
    SetupComponent,
    SetupComponentHost
} from "@mendix/widget-plugin-mobx-kit/main";
import { MapsContainerProps } from "../../../typings/MapsProps";
import { Marker, ModeledMarker } from "../../../typings/shared";
import { convertDynamicModeledMarker, convertStaticModeledMarker } from "../../utils/data";
import { GeocodeFunction } from "../tokens";

/**
 * Service responsible for resolving marker locations.
 * Handles geocoding of addresses and caching results.
 */
export class LocationResolverService implements SetupComponent {
    locations: Marker[] = [];
    private geocodeVersion = 0;

    constructor(
        host: SetupComponentHost,
        private readonly mainGate: DerivedPropsGate<MapsContainerProps>,
        private readonly geocode: GeocodeFunction
    ) {
        makeObservable(this, {
            locations: observable.ref,
            markers: computed,
            apiKey: computed,
            updateLocations: action
        });
        host.add(this);
    }

    /**
     * Computed property that combines static and dynamic markers.
     * Returns modeled markers ready for geocoding.
     */
    get markers(): ModeledMarker[] {
        const props = this.mainGate.props;

        const staticMarkers = props.markers.map(marker => convertStaticModeledMarker(marker));
        const dynamicMarkers = props.dynamicMarkers.map(marker => convertDynamicModeledMarker(marker)).flat();

        return [...staticMarkers, ...dynamicMarkers];
    }

    /**
     * Computed property for geocoding API key.
     * Prefers expression value over static configuration.
     */
    get apiKey(): string | undefined {
        return this.mainGate.props.geodecodeApiKeyExp?.value ?? this.mainGate.props.geodecodeApiKey;
    }

    /**
     * Action to update locations after geocoding completes.
     */
    updateLocations(locations: Marker[]): void {
        this.locations = locations;
    }

    /**
     * Setup reactive geocoding when markers change.
     */
    setup(): () => void {
        const [add, disposeAll] = disposeBatch();

        add(
            reaction(
                () => this.markers,
                currentMarkers => {
                    const version = ++this.geocodeVersion;

                    this.geocode(currentMarkers, this.apiKey)
                        .then(resolvedLocations => {
                            // Only update if this is still the latest request
                            if (this.geocodeVersion === version) {
                                this.updateLocations(resolvedLocations);
                            }
                        })
                        .catch(e => {
                            console.error("Failed to resolve marker locations:", e);
                        });
                },
                {
                    fireImmediately: true,
                    equals: (prev, next) => {
                        const prevProps = prev.map(({ action, ...marker }) => marker);
                        const nextProps = next.map(({ action, ...marker }) => marker);
                        return deepEqual(prevProps, nextProps, { strict: true });
                    }
                }
            )
        );

        return disposeAll;
    }
}
