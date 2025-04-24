import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { StaticBaseController, StaticBaseControllerProps } from "./StaticBaseController";
import { ComboboxControllerMixin } from "./mixins/ComboboxControllerMixin";

export class StaticComboboxController extends ComboboxControllerMixin(StaticBaseController) {
    constructor({ gate }: { gate: DerivedPropsGate<StaticBaseControllerProps> }) {
        super({ gate, multiselect: false });
        this.inputPlaceholder = gate.props.placeholder ?? "Search";
    }
}
