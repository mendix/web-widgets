import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { Container } from "brandi";
import { DatagridSetupService } from "../services/DatagridSetup.service";
import { TOKENS } from "../tokens";

/**
 * Root container for bindings that can be shared down the hierarchy.
 * Use only for bindings that needs to be shared across multiple containers.
 * @remark Don't bind things that depend on props here.
 */
export class RootContainer extends Container {
    id = `DatagridRootContainer@${generateUUID()}`;

    constructor() {
        super();
        this.bind(TOKENS.setupService).toInstance(DatagridSetupService).inSingletonScope();
    }
}
