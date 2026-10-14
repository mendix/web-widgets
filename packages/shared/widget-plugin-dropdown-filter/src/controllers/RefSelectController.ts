import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { SelectControllerMixin } from "./mixins/SelectControllerMixin";
import { RefBaseController, RefBaseControllerProps } from "./RefBaseController";

export class RefSelectController extends SelectControllerMixin(RefBaseController) {
    constructor({ gate }: { gate: DerivedPropsGate<RefBaseControllerProps> }) {
        super({ gate, multiselect: gate.props.multiselect });
    }

    handleFocus = (): void => {
        this.filterStore.setFetchReady(true);
    };

    handleMenuScrollEnd = (): void => {
        this.filterStore.loadMore();
    };
}
