import { constructWrapperStyle, getPlaygroundContext } from "@mendix/shared-charts/main";
import { createElement, Fragment, ReactElement } from "react";
import { CustomChartContainerProps } from "../typings/CustomChartProps";
import { useCustomChart } from "./hooks/useCustomChart";
import "./ui/CustomChart.scss";

const PlaygroundContext = getPlaygroundContext();

export default function CustomChart(props: CustomChartContainerProps): ReactElement {
    const { playgroundData, ref } = useCustomChart(props);
    const wrapperStyle = constructWrapperStyle(props);

    return (
        <Fragment>
            <PlaygroundContext.Provider value={playgroundData}>{props.playground}</PlaygroundContext.Provider>
            <div ref={ref} className="widget-custom-chart" style={wrapperStyle} tabIndex={props.tabIndex} />
        </Fragment>
    );
}
