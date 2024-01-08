import { ElementProps } from "@mendix/widget-plugin-grid/event-switch/base";
import { eventSwitch } from "@mendix/widget-plugin-grid/event-switch/use-event-switch";
import { PrimarySelectionProps } from "@mendix/widget-plugin-grid/selection/usePrimarySelectionProps";
import { getSelectionType } from "@mendix/widget-plugin-grid/selection/utils";
import { useEventCallback } from "@mendix/widget-plugin-hooks/useEventCallback";
import { ListActionValue, ObjectItem, SelectionMultiValue, SelectionSingleValue } from "mendix";
import { useMemo } from "react";
import { ItemSelectionMethodEnum, OnClickTriggerEnum } from "../../../typings/DatagridProps";
import { ExecuteActionFx, createActionHandlers } from "./action-handlers";
import { CellContext } from "./base";
import { createSelectHandlers } from "./select-handlers";
import { getSelectionMethod } from "./utils";

export class CellEventsController {
    constructor(
        private contextFactory: (item: ObjectItem) => CellContext,
        private selectionProps: PrimarySelectionProps,
        private executeActionFx: ExecuteActionFx
    ) {}

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

interface GridProps {
    pageSize: number;
    itemSelectionMethod: ItemSelectionMethodEnum;
    itemSelection?: SelectionSingleValue | SelectionMultiValue;
    onClickTrigger: OnClickTriggerEnum;
    onClick?: ListActionValue;
}

export function useCellEventsController(
    selectionProps: PrimarySelectionProps,
    { pageSize, itemSelectionMethod, itemSelection, onClickTrigger, onClick }: GridProps
): CellEventsController {
    const cellContextFactory = useEventCallback(
        (item: ObjectItem): CellContext => ({
            item,
            pageSize,
            selectionType: getSelectionType(itemSelection),
            selectionMethod: getSelectionMethod(itemSelectionMethod, itemSelection),
            clickTrigger: onClick ? onClickTrigger : "none"
        })
    );
    const executeActionFx = useEventCallback((item: ObjectItem) => onClick?.get(item));
    return useMemo(
        () => new CellEventsController(cellContextFactory, selectionProps, executeActionFx),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectionProps]
    );
}
