import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { RefBaseController, RefBaseControllerProps } from "./RefBaseController";
import { TagPickerControllerMixin } from "./mixins/TagPickerControllerMixin";

type SelectionMethodEnum = "checkbox" | "rowClick";
type SelectedItemsStyleEnum = "text" | "boxes";

interface Props extends RefBaseControllerProps {
    selectionMethod: SelectionMethodEnum;
    selectedItemsStyle: SelectedItemsStyleEnum;
}

export class RefTagPickerController extends TagPickerControllerMixin(RefBaseController) {
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

    handleFocus = (): void => {
        this.filterStore.setFetchReady(true);
    };

    handleMenuScrollEnd = (): void => {
        this.filterStore.loadMore();
    };
}
