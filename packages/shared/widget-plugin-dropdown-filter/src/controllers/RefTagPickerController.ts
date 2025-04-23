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

    constructor(props: Props) {
        super(props);
        this.inputPlaceholder = props.placeholder ?? "Search";
        this.filterSelectedOptions = props.selectionMethod === "rowClick";
        this.selectedStyle = props.selectedItemsStyle;
        this.selectionMethod = this.selectedStyle === "boxes" ? props.selectionMethod : "checkbox";
    }

    handleFocus = (): void => {
        this.filterStore.setFetchReady(true);
    };

    handleMenuScrollEnd = (): void => {
        this.filterStore.loadMore();
    };
}
