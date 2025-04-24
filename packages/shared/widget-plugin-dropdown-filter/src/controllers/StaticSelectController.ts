import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { SelectControllerMixin } from "./mixins/SelectControllerMixin";
import { StaticBaseController, StaticBaseControllerProps } from "./StaticBaseController";

export class StaticSelectController extends SelectControllerMixin(StaticBaseController) {
    constructor({ gate }: { gate: DerivedPropsGate<StaticBaseControllerProps> }) {
        super({ gate, multiselect: gate.props.multiselect });
        this.emptyOption.caption = gate.props.emptyCaption || "None";
        this.placeholder = gate.props.emptyCaption || "Select";
    }
}
