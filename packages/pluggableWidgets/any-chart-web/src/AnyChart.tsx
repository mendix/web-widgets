import { ReactElement, createElement } from "react";
import { AnyChartContainerProps } from "../typings/AnyChartProps";
import { useAnyChart } from "./hooks/useAnyChart";
import "./ui/AnyChart.scss";

export default function AnyChart(props: AnyChartContainerProps): ReactElement {
    const { chartRef, containerStyle } = useAnyChart(props);

    return <div ref={chartRef} className="widget-any-chart" style={containerStyle} tabIndex={props.tabIndex} />;
}
