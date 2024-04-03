import { useMemo, useEffect } from "react";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { ListActionValue, ObjectItem } from "mendix";

export type ExecuteActionFx = (item: ObjectItem) => void;

export type ClickTrigger = "single" | "double" | "none";

export class ClickActionHelper {
    constructor(private trigger: ClickTrigger, private listAction?: ListActionValue | null | object) {}

    get clickTrigger(): ClickTrigger {
        return this.listAction ? this.trigger : "none";
    }

    update(listAction?: ListActionValue | null | object): void {
        this.listAction = listAction;
    }

    onExecuteAction: ExecuteActionFx = item => {
        if (this.listAction && "get" in this.listAction) {
            executeAction(this.listAction.get(item));
        }
    };
}

interface HelperProps {
    onClickTrigger: ClickTrigger;
    onClick?: ListActionValue | null | object;
}

export function useClickActionHelper(props: HelperProps): ClickActionHelper {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const clickActionHelper = useMemo(() => new ClickActionHelper(props.onClickTrigger, props.onClick), []);

    useEffect(() => {
        clickActionHelper.update(props.onClick);
    });

    return clickActionHelper;
}
