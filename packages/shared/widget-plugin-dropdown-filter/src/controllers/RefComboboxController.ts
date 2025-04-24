import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ComboboxControllerMixin } from "./mixins/ComboboxControllerMixin";
import { RefBaseController, RefBaseControllerProps } from "./RefBaseController";

export class RefComboboxController extends ComboboxControllerMixin(RefBaseController) {
    constructor({ gate }: { gate: DerivedPropsGate<RefBaseControllerProps> }) {
        super({ gate, multiselect: false });
        this.inputPlaceholder = gate.props.placeholder ?? "Search";
    }

    handleFocus = (event: React.FocusEvent<HTMLInputElement>): void => {
        super.handleFocus(event);
        this.filterStore.setFetchReady(true);
    };

    handleMenuScrollEnd = (): void => {
        this.filterStore.loadMore();
    };
}
