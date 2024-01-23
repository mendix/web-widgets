import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { ListActionValue, ObjectItem } from "mendix";

export type ExecuteActionFx = (item: ObjectItem) => void;

export class ClickActionHelper {
    constructor(private listAction?: ListActionValue | null | object) {}

    update(listAction?: ListActionValue | null | object): void {
        this.listAction = listAction;
    }

    onExecuteAction: ExecuteActionFx = item => {
        if (this.listAction && "get" in this.listAction) {
            executeAction(this.listAction.get(item));
        }
    };
}
