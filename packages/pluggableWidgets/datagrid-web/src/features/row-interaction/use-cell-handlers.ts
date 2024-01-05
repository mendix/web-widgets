import { ObjectItem } from "mendix";
import { ElementProps } from "@mendix/widget-plugin-grid/event-switch/base";
import { useEventSwitch } from "@mendix/widget-plugin-grid/event-switch/use-event-switch";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { createActionHandlers } from "./action-handlers";
import { createSelectHandlers } from "./select-handlers";
import { createCellContext } from "./utils";

export function useCellHandlers(item: ObjectItem, props: DatagridContainerProps): ElementProps<HTMLDivElement> {
    return useEventSwitch(
        () => createCellContext(item, props),
        () => [...createActionHandlers(), ...createSelectHandlers()]
    );
}
