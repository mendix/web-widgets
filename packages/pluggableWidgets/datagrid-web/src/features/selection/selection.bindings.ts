import { Container, injected } from "brandi";
import { createSelectionHelper, SelectActionsProvider } from "@mendix/widget-plugin-grid/main";
import { SelectionCounterViewModel } from "@mendix/widget-plugin-grid/selection-counter/SelectionCounter.viewModel-atoms";
import { SelectionGate } from "./SelectionGate.service";
import { SELECTION_TOKENS as SELECTION } from "./tokens";
import { BindingGroup } from "../core/binding-group";
import { CORE_TOKENS as CORE } from "../core/tokens";

export const selectionBindings: BindingGroup = {
    inject() {
        injected(SelectionGate, CORE.mainGate);
        injected(createSelectionHelper, CORE.setupService, SELECTION.selectionGate, CORE.config.optional);
        injected(
            SelectionCounterViewModel,
            CORE.selection.selectedCount,
            CORE.selection.selectedCounterTextsStore,
            SELECTION.selectionCounterCfg.optional
        );
        injected(SelectActionsProvider, SELECTION.selectionType, SELECTION.selectionHelper);
    },
    define(container: Container) {
        container.bind(SELECTION.selectionGate).toInstance(SelectionGate).inTransientScope();
        container.bind(SELECTION.selectionHelper).toInstance(createSelectionHelper).inSingletonScope();
        container.bind(SELECTION.selectionCounterVM).toInstance(SelectionCounterViewModel).inSingletonScope();
        container.bind(SELECTION.selectActions).toInstance(SelectActionsProvider).inSingletonScope();
    },
    init(container, { config, props }) {
        container.bind(SELECTION.selectionType).toConstant(config.selectionType);
        container.bind(SELECTION.selectionCounterCfg).toConstant({ position: props.selectionCounterPosition });
    },
    postInit(container, { config }) {
        // Create selection helper if selection is enabled
        if (config.selectionEnabled) {
            container.get(SELECTION.selectionHelper);
        } else {
            // Override selection helper with null to disable selection features
            container.bind(SELECTION.selectionHelper).toConstant(null);
        }
    }
};
