import { Container, injected } from "brandi";
import { emptyStateWidgetsAtom } from "@mendix/widget-plugin-grid/core/models/empty-state.model";
import { EmptyPlaceholderViewModel } from "./EmptyPlaceholder.viewModel";
import { EMPTY_MESSAGE_TOKENS as EMPTY_MESSAGE } from "./tokens";
import { BindingGroup } from "../core/binding-group";
import { CORE_TOKENS as CORE } from "../core/tokens";

export const emptyMessageBindings: BindingGroup = {
    inject() {
        injected(emptyStateWidgetsAtom, CORE.mainGate, CORE.atoms.itemCount);
        injected(
            EmptyPlaceholderViewModel,
            EMPTY_MESSAGE.emptyPlaceholderWidgets,
            CORE.atoms.visibleColumnsCount,
            CORE.config
        );
    },
    define(container: Container) {
        container.bind(EMPTY_MESSAGE.emptyPlaceholderVM).toInstance(EmptyPlaceholderViewModel).inTransientScope();
        container.bind(EMPTY_MESSAGE.emptyPlaceholderWidgets).toInstance(emptyStateWidgetsAtom).inTransientScope();
    }
};
