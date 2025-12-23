import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { Container } from "brandi";
import { GallerySetupService } from "../services/GallerySetup.service";
import { CORE_TOKENS as CORE } from "../tokens";

/**
 * Root container for bindings that can be shared down the hierarchy.
 * Declare only bindings that needs to be shared across multiple containers.
 * @remark Don't bind constants or directly prop-dependent values here.
 * Prop-derived atoms/stores via dependency injection are acceptable.
 */
export class RootContainer extends Container {
    id = `GalleryRootContainer@${generateUUID()}`;
    constructor() {
        super();

        // Setup service
        this.bind(CORE.setupService).toInstance(GallerySetupService).inSingletonScope();
    }
}
