import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { RefBaseController, RefBaseControllerProps } from "./RefBaseController";
import { SelectControllerMixin } from "./mixins/SelectControllerMixin";

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
