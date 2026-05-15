import {
    DerivedPropsGate,
    disposeBatch,
    SetupComponent,
    SetupComponentHost
} from "@mendix/widget-plugin-mobx-kit/main";
import { injected } from "brandi";
import { action, computed, makeObservable, observable, reaction, runInAction } from "mobx";
import deepEqual from "deep-equal";
import { MapsContainerProps } from "../../../typings/MapsProps";
import { Marker, ModeledMarker } from "../../../typings/shared";
import { convertAddressToLatLng } from "../../utils/geodecode";
import { convertDynamicModeledMarker, convertStaticModeledMarker } from "../../utils/data";
import { CORE_TOKENS as CORE } from "../tokens";

/**
 * Service responsible for resolving marker locations.
 * Handles geocoding of addresses and caching results.
 */
export class LocationResolverService implements SetupComponent {
    locations: Marker[] = [];
    private requestedMarkers: ModeledMarker[] = [];

    constructor(
        host: SetupComponentHost,
        private readonly mainGate: DerivedPropsGate<MapsContainerProps>
    ) {
        makeObservable(this, {
            locations: observable.ref,
            markers: computed,
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
                    // Skip if markers haven't actually changed
                    if (this.isIdenticalMarkers(this.requestedMarkers, currentMarkers)) {
                        return;
                    }

                    this.requestedMarkers = currentMarkers;
                    const apiKey = this.mainGate.props.geodecodeApiKeyExp?.value ?? this.mainGate.props.geodecodeApiKey;

                    convertAddressToLatLng(currentMarkers, apiKey)
                        .then(resolvedLocations => {
                            // Only update if markers haven't changed again
                            if (this.requestedMarkers === currentMarkers) {
                                runInAction(() => {
                                    this.updateLocations(resolvedLocations);
                                });
                            }
                        })
                        .catch(e => {
                            console.error("Failed to resolve marker locations:", e);
                        });
                },
                { fireImmediately: true }
            )
        );

        return disposeAll;
    }

    /**
     * Compare markers for equality (excluding action callbacks).
     */
    private isIdenticalMarkers(previousMarkers: ModeledMarker[], newMarkers: ModeledMarker[]): boolean {
        const previousProps = previousMarkers.map(({ action, ...marker }) => marker);
        const newProps = newMarkers.map(({ action, ...marker }) => marker);
        return deepEqual(previousProps, newProps, { strict: true });
    }
}

// Inject dependencies
injected(LocationResolverService, CORE.setupService, CORE.mainGate);
