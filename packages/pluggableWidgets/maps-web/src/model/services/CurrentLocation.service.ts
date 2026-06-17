import { action, makeObservable, observable } from "mobx";
import { SetupComponent, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { MapsConfig } from "../configs/Maps.config";
import { Marker } from "../../../typings/shared";
import { GetLocationFunction } from "../tokens";

export class CurrentLocationService implements SetupComponent {
    location: Marker | undefined = undefined;

    constructor(
        host: SetupComponentHost,
        private readonly config: MapsConfig,
        private readonly getLocation: GetLocationFunction
    ) {
        makeObservable(this, {
            location: observable.ref,
            updateLocation: action
        });
        host.add(this);
    }

    updateLocation(location: Marker | undefined): void {
        this.location = location;
    }

    setup(): () => void {
        if (!this.config.showCurrentLocation) {
            return () => {};
        }

        let disposed = false;

        this.getLocation()
            .then(location => {
                if (!disposed) {
                    this.updateLocation(location);
                }
            })
            .catch(e => console.error(e));

        return () => {
            disposed = true;
        };
    }
}
