import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { Big } from "big.js";
import { EditableValue } from "mendix";
import { action, makeObservable } from "mobx";
import { GridPageControl } from "../interfaces/GridPageControl";
import { SetPageAction, SetPageSizeAction } from "./pagination.model";

export class PageControlService implements GridPageControl {
    constructor(
        private gate: DerivedPropsGate<{
            dynamicPage?: EditableValue<Big>;
            dynamicPageSize?: EditableValue<Big>;
            totalCountValue?: EditableValue<Big>;
            dynamicItemCount?: EditableValue<Big>;
        }>,
        private setPageSizeAction: SetPageSizeAction,
        private setPageAction: SetPageAction
    ) {
        // Annotate actions to prevent accidental subscribe in autorun or reactions.
        makeObservable(this, {
            setPageSize: action,
            setPage: action,
            setTotalCount: action,
            setItemCount: action
        });
    }

    setPageSize(pageSize: number): void {
        this.setPageSizeAction(pageSize);
    }

    setPage(page: number): void {
        this.setPageAction(page);
    }

    setTotalCount(count: number): void {
        const value = this.gate.props.totalCountValue;
        if (!value || value.readOnly) return;
        if (value.value?.eq(count)) return;
        value.setValue(new Big(count));
    }

    setItemCount(count: number): void {
        const value = this.gate.props.dynamicItemCount;
        if (!value || value.readOnly) return;
        if (value.value?.eq(count)) return;
        value.setValue(new Big(count));
    }
}
