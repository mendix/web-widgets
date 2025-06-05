import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { EnumBaseController, EnumBaseControllerProps } from "./EnumBaseController";
import { ComboboxControllerMixin } from "./mixins/ComboboxControllerMixin";

export class EnumComboboxController extends ComboboxControllerMixin(EnumBaseController) {
    constructor({ gate }: { gate: DerivedPropsGate<EnumBaseControllerProps> }) {
        super({ gate, multiselect: false });
        this.inputPlaceholder = gate.props.placeholder ?? "Search";
    }
}
