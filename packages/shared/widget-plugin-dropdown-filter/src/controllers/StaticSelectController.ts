import { SelectControllerMixin } from "./SelectControllerMixin";
import { StaticBaseController, StaticBaseControllerProps } from "./StaticBaseController";

export class StaticSelectController extends SelectControllerMixin(StaticBaseController) {
    constructor(props: StaticBaseControllerProps) {
        super(props);
        this.emptyOption.caption = props.emptyCaption || "None";
        this.placeholder = props.emptyCaption || "Select";
    }
}
