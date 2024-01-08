import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { ListActionValue, ObjectItem } from "mendix";
import { OnClickTriggerEnum } from "../../typings/DatagridProps";

export type ExecuteActionFx = (item: ObjectItem) => void;

export type ClickTrigger = "single" | "double" | "none";

export class ClickActionHelper {
    constructor(private trigger: OnClickTriggerEnum, private listAction?: ListActionValue) {}

    get clickTrigger(): ClickTrigger {
        return this.listAction ? this.trigger : "none";
    }

    update(listAction?: ListActionValue): void {
        this.listAction = listAction;
    }

    onExecuteAction: ExecuteActionFx = item => {
        executeAction(this.listAction?.get(item));
    };
}
