import { action, computed, makeObservable, observable, reaction } from "mobx";
import {
    DerivedPropsGate,
    disposeBatch,
    SetupComponent,
    SetupComponentHost
} from "@mendix/widget-plugin-mobx-kit/main";
import { MapsContainerProps } from "../../../typings/MapsProps";
import { Marker } from "../../../typings/shared";
import { GetLocationFunction } from "../tokens";

/**
 * Service responsible for resolving the current user location.
 * Requests the location whenever `showCurrentLocation` becomes true
 * and clears it when the option is disabled.
 */
export class CurrentLocationService implements SetupComponent {
    location: Marker | undefined = undefined;
    private locationVersion = 0;

    constructor(
        host: SetupComponentHost,
        private readonly mainGate: DerivedPropsGate<MapsContainerProps>,
        private readonly getLocation: GetLocationFunction
    ) {
        makeObservable(this, {
            location: observable.ref,
            showCurrentLocation: computed,
            updateLocation: action
        });
        host.add(this);
    }

    /** Computed property reflecting the `showCurrentLocation` widget prop. */
    get showCurrentLocation(): boolean {
        return this.mainGate.props.showCurrentLocation;
    }

    /** Action to update the current location once it is resolved. */
    updateLocation(location: Marker | undefined): void {
        this.location = location;
    }

    /** Setup reactive location tracking. */
    setup(): () => void {
        const [add, disposeAll] = disposeBatch();

        add(
            reaction(
                () => this.showCurrentLocation,
                show => {
                    const version = ++this.locationVersion;

                    if (!show) {
                        this.updateLocation(undefined);
                        return;
                    }

                    this.getLocation()
                        .then(location => {
                            // Only update if this is still the latest request
                            if (this.locationVersion === version) {
                                this.updateLocation(location);
                            }
                        })
                        .catch(e => console.error(e));
                },
                { fireImmediately: true }
            )
        );

        return disposeAll;
    }
}
