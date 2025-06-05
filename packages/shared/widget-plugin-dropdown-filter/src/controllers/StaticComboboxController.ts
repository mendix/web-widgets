import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { EnumBaseController, StaticBaseControllerProps } from "./EnumBaseController";
import { ComboboxControllerMixin } from "./mixins/ComboboxControllerMixin";

export class StaticComboboxController extends ComboboxControllerMixin(EnumBaseController) {
    constructor({ gate }: { gate: DerivedPropsGate<StaticBaseControllerProps> }) {
        super({ gate, multiselect: false });
        this.inputPlaceholder = gate.props.placeholder ?? "Search";
    }
}
