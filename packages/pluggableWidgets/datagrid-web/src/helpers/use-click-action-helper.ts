import { useEffect, useMemo } from "react";
import { DatagridContainerProps, DatagridPreviewProps } from "../../typings/DatagridProps";
import { ClickActionHelper } from "./ClickActionHelper";

export function useClickActionHelper(
    props: Pick<DatagridContainerProps | DatagridPreviewProps, "onClick" | "onClickTrigger">
): ClickActionHelper {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const clickActionHelper = useMemo(() => new ClickActionHelper(props.onClickTrigger, props.onClick), []);

    useEffect(() => {
        clickActionHelper.update(props.onClick);
    });

    return clickActionHelper;
}
