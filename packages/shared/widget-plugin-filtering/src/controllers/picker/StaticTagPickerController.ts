import { StaticBaseController, StaticBaseControllerProps } from "./StaticBaseController";
import { TagPickerControllerMixin } from "./mixins/TagPickerControllerMixin";

type SelectionMethodEnum = "checkbox" | "rowClick";
type SelectedItemsStyleEnum = "text" | "boxes";

interface Props extends StaticBaseControllerProps {
    selectionMethod: SelectionMethodEnum;
    selectedItemsStyle: SelectedItemsStyleEnum;
}

export class StaticTagPickerController extends TagPickerControllerMixin(StaticBaseController) {
    selectionMethod: SelectionMethodEnum;
    selectedStyle: SelectedItemsStyleEnum;

    constructor(props: Props) {
        super(props);
        this.inputPlaceholder = props.placeholder;
        this.emptyCaption = props.emptySelectionCaption;
        this.ariaLabel = props.ariaLabel;
        this.filterSelectedOptions = props.selectionMethod === "rowClick";
        this.selectedStyle = props.selectedItemsStyle;
        this.selectionMethod = this.selectedStyle === "boxes" ? props.selectionMethod : "checkbox";
    }
}
