import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { FocusEvent } from "react";
import { ComboboxControllerMixin } from "./mixins/ComboboxControllerMixin";
import { RefBaseController, RefBaseControllerProps } from "./RefBaseController";

export class RefComboboxController extends ComboboxControllerMixin(RefBaseController) {
    constructor({ gate }: { gate: DerivedPropsGate<RefBaseControllerProps> }) {
        super({ gate, multiselect: false });
        this.inputPlaceholder = gate.props.placeholder;
        this.emptyCaption = gate.props.emptySelectionCaption;
        this.ariaLabel = gate.props.ariaLabel;
    }

    handleFocus = (event: FocusEvent<HTMLInputElement>): void => {
        super.handleFocus(event);
        this.filterStore.setFetchReady(true);
    };

    handleMenuScrollEnd = (): void => {
        this.filterStore.loadMore();
    };
}
