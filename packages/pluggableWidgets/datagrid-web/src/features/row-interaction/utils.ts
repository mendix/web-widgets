import { ObjectItem, SelectionSingleValue, SelectionMultiValue, ListActionValue } from "mendix";
import { DatagridContainerProps, ItemSelectionMethodEnum, OnClickTriggerEnum } from "../../../typings/DatagridProps";
import { CellContext, CheckboxContext, ClickTrigger, SelectionMethod } from "./base";
import { getSelectionType } from "@mendix/widget-plugin-grid/selection/utils";
import { PrimarySelectionProps } from "@mendix/widget-plugin-grid/selection/usePrimarySelectionProps";
import { ElementProps } from "@mendix/widget-plugin-grid/event-switch/base";
import { eventSwitch } from "@mendix/widget-plugin-grid/event-switch/use-event-switch";
import { createSelectHandlers } from "./select-handlers";
import { ExecuteActionFx, createActionHandlers } from "./action-handlers";
import { useEventCallback } from "@mendix/widget-plugin-hooks/useEventCallback";

export function getSelectionMethod(
    method: ItemSelectionMethodEnum,
    selection?: SelectionSingleValue | SelectionMultiValue
): SelectionMethod {
    return selection ? method : "none";
}

type GridProps = {
    pageSize: number;
    itemSelectionMethod: ItemSelectionMethodEnum;
    itemSelection?: SelectionSingleValue | SelectionMultiValue;
    onClickTrigger: OnClickTriggerEnum;
    onClick?: ListActionValue;
};
export function useCellContextFactory({
    pageSize,
    itemSelectionMethod,
    itemSelection,
    onClickTrigger,
    onClick
}: GridProps): (item: ObjectItem) => CellContext {
    return useEventCallback((item: ObjectItem) => ({
        item,
        pageSize,
        selectionType: getSelectionType(itemSelection),
        selectionMethod: getSelectionMethod(itemSelectionMethod, itemSelection),
        clickTrigger: onClick ? onClickTrigger : "none"
    }));
}

// export function createCheckboxContext(
//     item: ObjectItem,
//     { itemSelection, itemSelectionMethod }: DatagridContainerProps
// ): CheckboxContext {
//     return {
//         item,
//         selectionMethod: getSelectionMethod(itemSelectionMethod, itemSelection)
//     };
// }

export class CellEventsController {
    constructor(
        private selectionProps: PrimarySelectionProps,
        private executeActionFx: ExecuteActionFx,
        private contextFactory: (item: ObjectItem) => CellContext
    ) {}

    // private createCellContext(item: ObjectItem): CellContext {
    //     return {
    //         clickTrigger: this.getClickTrigger(),
    //         item,
    //         pageSize: this.gridProps.pageSize,
    //         selectionMethod: this.getSelectionMethod(),
    //         selectionType: getSelectionType(this.gridProps.selection)
    //     };
    // }

    // private getSelectionMethod(): SelectionMethod {
    //     return this.gridProps.selection ? this.gridProps.selectionMethod : "none";
    // }

    // private getClickTrigger(): ClickTrigger {
    //     return this.gridProps.onClick ? this.gridProps.onClickTrigger : "none";
    // }

    // updateGridProps(props: GridProps): void {
    //     this.gridProps = props;
    // }

    getProps(item: ObjectItem): ElementProps<HTMLDivElement> {
        const entries = [
            ...createSelectHandlers(
                this.selectionProps.onSelect,
                this.selectionProps.onSelectAll,
                this.selectionProps.onSelectAdjacent as any
            ),
            ...createActionHandlers(this.executeActionFx)
        ];
        return eventSwitch<CellContext, HTMLDivElement>(() => this.contextFactory(item), entries);
    }
}
