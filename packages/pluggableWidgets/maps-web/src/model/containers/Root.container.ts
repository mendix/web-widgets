import { Container } from "brandi";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { convertAddressToLatLng } from "../../utils/geodecode";
import { getCurrentUserLocation } from "../../utils/location";
import { MapsSetupService } from "../services/MapsSetup.service";
import { CORE_TOKENS as CORE } from "../tokens";

/**
 * Root container for bindings that can be shared down the hierarchy.
 * Declare only bindings that needs to be shared across multiple containers.
 */
export class RootContainer extends Container {
    id = `MapsRootContainer@${generateUUID()}`;
    constructor() {
        super();

        // Setup service
        this.bind(CORE.setupService).toInstance(MapsSetupService).inSingletonScope();

        // Geocode function
        this.bind(CORE.geocodeFunction).toConstant(convertAddressToLatLng);

        // Current location function
        this.bind(CORE.getLocationFunction).toConstant(getCurrentUserLocation);
    }
}
