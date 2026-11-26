import { Container, injected } from "brandi";
import { ColumnGroupStore } from "./ColumnGroupStore";
import { gridStyleAtom } from "./grid.model";
import { COLUMNS_TOKENS as COLUMNS } from "./tokens";
import { BindingGroup } from "../core/binding-group";
import { CORE_TOKENS as CORE } from "../core/tokens";
import { DATASOURCE_TOKENS as DATASOURCE } from "../datasource/tokens";
import { PAGINATION_TOKENS as PAGINATION } from "../pagination/tokens";

export const columnsBindings: BindingGroup = {
    inject() {
        injected(ColumnGroupStore, CORE.setupService, CORE.mainGate, CORE.config, DATASOURCE.filterHost);
        injected(gridStyleAtom, COLUMNS.columnsStore, CORE.config, PAGINATION.gridSizeStore);
    },
    define(container: Container) {
        container.bind(COLUMNS.columnsStore).toInstance(ColumnGroupStore).inSingletonScope();
        container.bind(COLUMNS.gridColumnsStyle).toInstance(gridStyleAtom).inTransientScope();
    }
};
