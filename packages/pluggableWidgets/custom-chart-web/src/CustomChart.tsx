import { ReactElement, createElement } from "react";
import { CustomChartContainerProps } from "../typings/CustomChartProps";
import { useCustomChart } from "./hooks/useCustomChart";
import { useActionEvents } from "./hooks/useActionEvents";
import "./ui/CustomChart.scss";

export default function CustomChart(props: CustomChartContainerProps): ReactElement {
    const { chartRef, containerStyle } = useCustomChart(props);
    const { handleClick } = useActionEvents(props);

    return (
        <div
            ref={chartRef}
            className="widget-custom-chart"
            style={containerStyle}
            tabIndex={props.tabIndex}
            onClick={handleClick}
        />
    );
}
