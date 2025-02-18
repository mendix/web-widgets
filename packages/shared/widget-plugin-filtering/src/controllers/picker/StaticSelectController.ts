import { StaticBaseController, StaticBaseControllerProps } from "./StaticBaseController";
import { SelectControllerMixin } from "./mixins/SelectControllerMixin";

export class StaticSelectController extends SelectControllerMixin(StaticBaseController) {
    constructor(props: StaticBaseControllerProps) {
        super(props);
        this.emptyOption.caption = props.emptyCaption || "None";
        this.placeholder = props.emptyCaption || "Select";
    }
}
