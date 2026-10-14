import { useCallback } from "react";
import { CustomChartContainerProps } from "typings/CustomChartProps";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";

export function useActionEvents(props: CustomChartContainerProps): {
    handleClick: () => void;
} {
    const handleClick = useCallback((): void => {
        if (props.onClick) {
            executeAction(props.onClick);
        }
    }, [props.onClick]);

    return { handleClick };
}
