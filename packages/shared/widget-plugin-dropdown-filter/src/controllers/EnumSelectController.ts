import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { EnumBaseController, EnumBaseControllerProps } from "./EnumBaseController";
import { SelectControllerMixin } from "./mixins/SelectControllerMixin";

export class EnumSelectController extends SelectControllerMixin(EnumBaseController) {
    constructor({ gate }: { gate: DerivedPropsGate<EnumBaseControllerProps> }) {
        super({ gate, multiselect: gate.props.multiselect });
        this.emptyOption.caption = gate.props.emptyOptionCaption;
        this.emptyCaption = gate.props.emptySelectionCaption;
        this.ariaLabel = gate.props.ariaLabel;
    }
}
