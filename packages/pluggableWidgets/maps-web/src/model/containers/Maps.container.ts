import { Container, injected } from "brandi";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { MapsContainerProps } from "../../../typings/MapsProps";
import { apiKeyAtom } from "../atoms/apiKey.atom";
import { geodecodeApiKeyAtom } from "../atoms/geodecodeApiKey.atom";
import { MapsConfig } from "../configs/Maps.config";
import { CurrentLocationService } from "../services/CurrentLocation.service";
import { LocationResolverService } from "../services/LocationResolver.service";
import { CORE_TOKENS as CORE, MAPS_TOKENS as MAPS } from "../tokens";

interface InitDependencies {
    props: MapsContainerProps;
    mainGate: DerivedPropsGate<MapsContainerProps>;
    config: MapsConfig;
}

/** Just little utility object to group related bindings */
interface BindingGroup {
    /** Runs during container constructor. Use this hook to add new binding to the container. */
    define?(container: Container): void;
    /** Runs on container init with deps. Use this hook to bind constants, configs and values that depend on props. */
    init?(container: Container, deps: InitDependencies): void;
    /** This method runs after init phase. Use this hook to init instances and other "bootstrapping" work. */
    postInit?(container: Container, deps: InitDependencies): void;
    /** This method runs only once. Should be used to inject dependencies. */
    inject?(): void;
}

const _01_coreBindings: BindingGroup = {
    inject() {
        injected(LocationResolverService, CORE.setupService, CORE.mainGate, CORE.geocodeFunction, CORE.geodecodeApiKey);
        injected(CurrentLocationService, CORE.setupService, CORE.config, CORE.getLocationFunction);
    },
    define(container) {
        container.bind(MAPS.locationResolver).toInstance(LocationResolverService).inSingletonScope();
        container.bind(MAPS.currentLocation).toInstance(CurrentLocationService).inSingletonScope();
    },
    init(container, { mainGate, config }) {
        container.bind(CORE.mainGate).toConstant(mainGate);
        container.bind(CORE.config).toConstant(config);
        container.bind(CORE.apiKey).toConstant(apiKeyAtom(mainGate));
        container.bind(CORE.geodecodeApiKey).toConstant(geodecodeApiKeyAtom(mainGate));
    },
    postInit(container) {
        // Initialize services to trigger setup
        container.get(MAPS.locationResolver);
        container.get(MAPS.currentLocation);
    }
};

const groups = [_01_coreBindings];

// Inject tokens from groups
for (const grp of groups) {
    grp.inject?.();
}

export class MapsContainer extends Container {
    id = `MapsContainer@${generateUUID()}`;

    constructor(root: Container) {
        super();
        this.extend(root);

        for (const grp of groups) {
            grp.define?.(this);
        }
    }

    init(deps: InitDependencies): this {
        for (const grp of groups) {
            grp.init?.(this, deps);
        }

        for (const grp of groups) {
            grp.postInit?.(this, deps);
        }

        return this;
    }
}
