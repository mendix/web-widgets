import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { EnumBaseController, StaticBaseControllerProps } from "./EnumBaseController";
import { SelectControllerMixin } from "./mixins/SelectControllerMixin";

export class StaticSelectController extends SelectControllerMixin(EnumBaseController) {
    constructor({ gate }: { gate: DerivedPropsGate<StaticBaseControllerProps> }) {
        super({ gate, multiselect: gate.props.multiselect });
        this.emptyOption.caption = gate.props.emptyCaption || "None";
        this.placeholder = gate.props.emptyCaption || "Select";
    }
}
