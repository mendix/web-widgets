import { Fragment, ReactElement } from "react";
import { constructWrapperStyle, getPlaygroundContext } from "@mendix/shared-charts/main";
import { CustomChartContainerProps } from "../typings/CustomChartProps";
import { useCustomChart } from "./hooks/useCustomChart";
import "./ui/CustomChart.scss";
import { observer } from "mobx-react-lite";

const PlaygroundContext = getPlaygroundContext();

const Container = observer(function CustomChart(props: CustomChartContainerProps): ReactElement {
    const { playgroundData, ref } = useCustomChart(props);
    const wrapperStyle = constructWrapperStyle(props);

    return (
        <Fragment>
            <PlaygroundContext.Provider value={playgroundData}>{props.playground}</PlaygroundContext.Provider>
            <div ref={ref} className="widget-custom-chart" style={wrapperStyle} tabIndex={props.tabIndex} />
        </Fragment>
    );
});

export default function CustomChart(props: CustomChartContainerProps): ReactElement {
    return <Container {...props} />;
}
