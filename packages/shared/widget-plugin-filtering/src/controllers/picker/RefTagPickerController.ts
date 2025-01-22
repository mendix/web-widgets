import { RefBaseController, RefBaseControllerProps } from "./RefBaseController";
import { TagPickerControllerMixin } from "./mixins/TagPickerControllerMixin";

export class RefTagPickerController extends TagPickerControllerMixin(RefBaseController) {
    constructor(props: RefBaseControllerProps) {
        super(props);
        this.inputPlaceholder = props.inputPlaceholder ?? "Search";
    }

    handleFocus = (): void => {
        this.filterStore.setFetchReady(true);
    };
}
