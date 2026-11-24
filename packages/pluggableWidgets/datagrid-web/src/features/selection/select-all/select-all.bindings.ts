import { SelectAllModule } from "./SelectAllModule.container";
import { SA_TOKENS } from "./tokens";
import { BindingGroup } from "../../core/binding-group";

export const selectAllBindings: BindingGroup<{ selectAllModule: SelectAllModule }> = {
    init(container, { selectAllModule }) {
        container.bind(SA_TOKENS.progressService).toConstant(selectAllModule.get(SA_TOKENS.progressService));
        container.bind(SA_TOKENS.selectionDialogVM).toConstant(selectAllModule.get(SA_TOKENS.selectionDialogVM));
        container.bind(SA_TOKENS.selectAllBarVM).toConstant(selectAllModule.get(SA_TOKENS.selectAllBarVM));
    }
};
