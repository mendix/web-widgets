import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { EnumBaseController, EnumBaseControllerProps } from "./EnumBaseController";
import { TagPickerControllerMixin } from "./mixins/TagPickerControllerMixin";

type SelectionMethodEnum = "checkbox" | "rowClick";
type SelectedItemsStyleEnum = "text" | "boxes";

interface Props extends EnumBaseControllerProps {
    selectionMethod: SelectionMethodEnum;
    selectedItemsStyle: SelectedItemsStyleEnum;
}

export class EnumTagPickerController extends TagPickerControllerMixin(EnumBaseController) {
    selectionMethod: SelectionMethodEnum;
    selectedStyle: SelectedItemsStyleEnum;

    constructor({ gate }: { gate: DerivedPropsGate<Props> }) {
        super({ gate, multiselect: gate.props.multiselect });
        this.inputPlaceholder = gate.props.placeholder;
        this.emptyCaption = gate.props.emptySelectionCaption;
        this.ariaLabel = gate.props.ariaLabel;
        this.filterSelectedOptions = gate.props.selectionMethod === "rowClick";
        this.selectedStyle = gate.props.selectedItemsStyle;
        this.selectionMethod = this.selectedStyle === "boxes" ? gate.props.selectionMethod : "checkbox";
    }
}
