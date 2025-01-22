import { StaticBaseController, StaticBaseControllerProps } from "./StaticBaseController";
import { TagPickerControllerMixin } from "./mixins/TagPickerControllerMixin";

export class StaticTagPickerController extends TagPickerControllerMixin(StaticBaseController) {
    constructor(props: StaticBaseControllerProps) {
        super(props);
        this.inputPlaceholder = props.inputPlaceholder ?? "Search";
    }
}
