import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { Big } from "big.js";
import { EditableValue } from "mendix";
import { GridPageControl } from "../interfaces/GridPageControl";
import { SetPageAction, SetPageSizeAction } from "./pagination.model";

export class PageControlService implements GridPageControl {
    constructor(
        private gate: DerivedPropsGate<{
            dynamicPage?: EditableValue<Big>;
            dynamicPageSize?: EditableValue<Big>;
            totalCountValue?: EditableValue<Big>;
            loadedRowsValue?: EditableValue<Big>;
        }>,
        private setPageSizeAction: SetPageSizeAction,
        private setPageAction: SetPageAction
    ) {}

    setPageSize(pageSize: number): void {
        this.setPageSizeAction(pageSize);
        const value = this.gate.props.dynamicPageSize;
        if (!value || value.readOnly) return;
        value.setValue(new Big(pageSize));
    }

    setPage(page: number): void {
        this.setPageAction(page);
        const value = this.gate.props.dynamicPage;
        if (!value || value.readOnly) return;
        // page is 0-based internally; store as 1-based in the attribute
        value.setValue(new Big(page + 1));
    }

    setTotalCount(count: number): void {
        const value = this.gate.props.totalCountValue;
        if (!value || value.readOnly) return;
        value.setValue(new Big(count));
    }

    setLoadedRows(count: number): void {
        const value = this.gate.props.loadedRowsValue;
        if (!value || value.readOnly) return;
        value.setValue(new Big(count));
    }
}
