import { ComboboxControllerMixin } from "./mixins/ComboboxControllerMixin";
import { RefBaseController, RefBaseControllerProps } from "./RefBaseController";

export class RefComboboxController extends ComboboxControllerMixin(RefBaseController) {
    constructor(props: RefBaseControllerProps) {
        super({ ...props, multiselect: false });
        this.inputPlaceholder = props.inputPlaceholder ?? "Search";
        this.inputValue = this.inputInitValue;
    }

    handleFocus = (event: React.FocusEvent<HTMLInputElement>): void => {
        super.handleFocus(event);
        this.filterStore.setFetchReady(true);
    };

    handleMenuScrollEnd = (): void => {
        this.filterStore.loadMore();
    };
}
