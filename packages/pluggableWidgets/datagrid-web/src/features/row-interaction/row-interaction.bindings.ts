import { Container, injected } from "brandi";
import { createClickActionHelper, createFocusController, layoutAtom } from "@mendix/widget-plugin-grid/main";
import { createCellEventsController } from "./CellEventsController";
import { creteCheckboxEventsController } from "./CheckboxEventsController";
import { ROW_INTERACTION_TOKENS as ROW_INTERACTION } from "./tokens";
import { BindingGroup } from "../core/binding-group";
import { CORE_TOKENS as CORE } from "../core/tokens";
import { PAGINATION_TOKENS as PAGINATION } from "../pagination/tokens";
import { SELECTION_TOKENS as SELECTION } from "../selection/tokens";

export const rowInteractionBindings: BindingGroup = {
    inject() {
        injected(createFocusController, CORE.setupService, ROW_INTERACTION.virtualLayout);
        injected(
            creteCheckboxEventsController,
            CORE.config,
            SELECTION.selectActions,
            ROW_INTERACTION.focusService,
            PAGINATION.pageSize
        );
        injected(layoutAtom, CORE.atoms.itemCount, CORE.atoms.columnCount, PAGINATION.pageSize);
        injected(createClickActionHelper, CORE.setupService, CORE.mainGate);
        injected(
            createCellEventsController,
            CORE.config,
            SELECTION.selectActions,
            ROW_INTERACTION.focusService,
            ROW_INTERACTION.clickActionHelper,
            PAGINATION.pageSize
        );
    },
    define(container: Container) {
        container.bind(ROW_INTERACTION.focusService).toInstance(createFocusController).inSingletonScope();
        container
            .bind(ROW_INTERACTION.checkboxEventsHandler)
            .toInstance(creteCheckboxEventsController)
            .inSingletonScope();
        container.bind(ROW_INTERACTION.virtualLayout).toInstance(layoutAtom).inTransientScope();
        container.bind(ROW_INTERACTION.clickActionHelper).toInstance(createClickActionHelper).inSingletonScope();
        container.bind(ROW_INTERACTION.cellEventsHandler).toInstance(createCellEventsController).inSingletonScope();
    }
};
