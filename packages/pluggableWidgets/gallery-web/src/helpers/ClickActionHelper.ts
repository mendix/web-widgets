import { ListActionValue, ObjectItem } from "mendix";
import { useEffect, useMemo } from "react";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { GalleryContainerProps, GalleryPreviewProps } from "../../typings/GalleryProps";

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

export function useClickActionHelper(
    props: Pick<GalleryContainerProps | GalleryPreviewProps, "onClick">
): ClickActionHelper {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const clickActionHelper = useMemo(() => new ClickActionHelper(props.onClick), []);

    useEffect(() => {
        clickActionHelper.update(props.onClick);
    });

    return clickActionHelper;
}
