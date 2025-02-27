import { getPlaygroundContext } from "@mendix/shared-charts/main";
import { createElement, Fragment, ReactElement } from "react";
import { CustomChartContainerProps } from "../typings/CustomChartProps";
import { useCustomChart } from "./hooks/useCustomChart";
import "./ui/CustomChart.scss";

const PlaygroundContext = getPlaygroundContext();

export default function CustomChart(props: CustomChartContainerProps): ReactElement {
    const { containerStyle, playgroundData, ref } = useCustomChart(props);

    return (
        <Fragment>
            <PlaygroundContext.Provider value={playgroundData}>{props.playground}</PlaygroundContext.Provider>
            <div ref={ref} className="widget-custom-chart" style={containerStyle} tabIndex={props.tabIndex} />
        </Fragment>
    );
}
