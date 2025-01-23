import { RefBaseController, RefBaseControllerProps } from "./RefBaseController";
import { TagPickerControllerMixin } from "./mixins/TagPickerControllerMixin";

interface Props extends RefBaseControllerProps {
    selectionMethod: "checkbox" | "rowClick";
}

export class RefTagPickerController extends TagPickerControllerMixin(RefBaseController) {
    constructor(props: Props) {
        super(props);
        this.inputPlaceholder = props.inputPlaceholder ?? "Search";
        this.filterSelectedOptions = props.selectionMethod === "rowClick";
    }

    handleFocus = (): void => {
        this.filterStore.setFetchReady(true);
    };
}
