import { ReactElement, createElement, useEffect } from "react";
import { CustomChartContainerProps } from "../typings/CustomChartProps";
import { useCustomChart } from "./hooks/useCustomChart";
// import { useActionEvents } from "./hooks/useActionEvents";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import "./ui/CustomChart.scss";

export default function CustomChart(props: CustomChartContainerProps): ReactElement {
    const { chartRef, containerStyle } = useCustomChart(props);
    // const { handleClick } = useActionEvents(props);

    useEffect(() => {
        if (props.eventDataAttribute && props.eventDataAttribute.value && props.onClick) {
            executeAction(props.onClick);
            //reset to allow re-click on same spot
            props.eventDataAttribute.setValue("");
        }
    }, [props.eventDataAttribute?.value]);
    return (
        <div
            ref={chartRef}
            className="widget-custom-chart"
            style={containerStyle}
            tabIndex={props.tabIndex}
            // onClick={handleClick}
        />
    );
}
