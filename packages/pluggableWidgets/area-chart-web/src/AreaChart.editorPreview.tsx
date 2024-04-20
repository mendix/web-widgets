import { createElement, ReactNode } from "react";
import AreaChartImage from "./assets/AreaChart.light.svg";
import AreaChartLegend from "./assets/AreaChart-legend.light.svg";
import { AreaChartPreviewProps } from "../typings/AreaChartProps";

function Chart(props: AreaChartPreviewProps): ReactNode {
    return (
        <div
            className={props.class}
            style={{
                display: "flex",
                width: props.showLegend ? "385px" : "300px",
                height: "232px"
            }}
        >
            <img
                src={AreaChartImage}
                alt="area-chart-image"
                style={{ objectFit: "contain", width: "300px", height: "100%" }}
            />
            {props.showLegend ? <img src={AreaChartLegend} alt="area-chart-legend" style={{ width: "85px" }} /> : null}
        </div>
    );
}

export function preview(props: AreaChartPreviewProps): ReactNode {
    const { renderer: PlaygroundSlog } = props.playground ?? { renderer: () => null };
    return (
        <div style={{ display: "inline-flex", flexFlow: "column nowrap" }}>
            <Chart {...props} />
            <PlaygroundSlog caption="Playground slot">{<div />}</PlaygroundSlog>
        </div>
    );
}
