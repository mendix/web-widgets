import { StaticBaseController, StaticBaseControllerProps } from "./StaticBaseController";
import { TagPickerControllerMixin } from "./mixins/TagPickerControllerMixin";

interface Props extends StaticBaseControllerProps {
    selectionMethod: "checkbox" | "rowClick";
}

export class StaticTagPickerController extends TagPickerControllerMixin(StaticBaseController) {
    constructor(props: Props) {
        super(props);
        this.inputPlaceholder = props.inputPlaceholder ?? "Search";
        this.filterSelectedOptions = props.selectionMethod === "rowClick";
    }
}
