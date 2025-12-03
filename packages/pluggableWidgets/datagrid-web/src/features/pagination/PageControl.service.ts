import { SetPageAction, SetPageSizeAction } from "@mendix/widget-plugin-grid/main";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { Big } from "big.js";
import { EditableValue } from "mendix";
import { GridPageControl } from "./GridPageControl";

export class PageControlService implements GridPageControl {
    constructor(
        private gate: DerivedPropsGate<{
            totalCountValue?: EditableValue<Big>;
        }>,
        private setPageSizeAction: SetPageSizeAction,
        private setPageAction: SetPageAction
    ) {}

    setPageSize(pageSize: number): void {
        this.setPageSizeAction(pageSize);
    }

    setPage(page: number): void {
        this.setPageAction(page);
    }

    setTotalCount(count: number): void {
        const value = this.gate.props.totalCountValue;
        if (!value || value.readOnly) return;
        value.setValue(new Big(count));
    }
}
