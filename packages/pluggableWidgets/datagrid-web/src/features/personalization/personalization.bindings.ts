import { Container, injected } from "brandi";
import { GridPersonalizationStore } from "./GridPersonalizationStore";
import { PERSONALIZATION_TOKENS as PERSONALIZATION } from "./tokens";
import { COLUMNS_TOKENS as COLUMNS } from "../columns/tokens";
import { BindingGroup } from "../core/binding-group";
import { CORE_TOKENS as CORE } from "../core/tokens";
import { DATASOURCE_TOKENS as DATASOURCE } from "../datasource/tokens";

export const personalizationBindings: BindingGroup = {
    inject() {
        injected(
            GridPersonalizationStore,
            CORE.setupService,
            CORE.mainGate,
            COLUMNS.columnsStore,
            DATASOURCE.filterHost
        );
    },
    define(container: Container) {
        container.bind(PERSONALIZATION.personalizationService).toInstance(GridPersonalizationStore).inSingletonScope();
    },
    postInit(container, { config }) {
        // Enable personalization if configured
        if (config.settingsStorageEnabled) {
            container.get(PERSONALIZATION.personalizationService);
        }
    }
};
