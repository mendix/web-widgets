import { StaticBaseController, StaticBaseControllerProps } from "./StaticBaseController";
import { ComboboxControllerMixin } from "./mixins/ComboboxControllerMixin";

export class StaticComboboxController extends ComboboxControllerMixin(StaticBaseController) {
    constructor(props: StaticBaseControllerProps) {
        super({ ...props, multiselect: false });
        this.inputPlaceholder = props.placeholder ?? "Search";
    }
}
