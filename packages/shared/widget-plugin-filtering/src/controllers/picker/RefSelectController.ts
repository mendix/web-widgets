import { RefBaseController, RefBaseControllerProps } from "./RefBaseController";
import { SelectControllerMixin } from "./mixins/SelectControllerMixin";

export class RefSelectController extends SelectControllerMixin(RefBaseController) {
    constructor(props: RefBaseControllerProps) {
        super(props);
        this.emptyOption.caption = props.emptyOptionCaption;
        this.emptyCaption = props.emptySelectionCaption;
        this.ariaLabel = props.ariaLabel;
    }

    handleFocus = (): void => {
        this.filterStore.setFetchReady(true);
    };

    handleMenuScrollEnd = (): void => {
        this.filterStore.loadMore();
    };
}
