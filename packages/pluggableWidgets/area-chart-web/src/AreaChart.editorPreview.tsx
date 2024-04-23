import { createElement, ReactNode } from "react";
import AreaChartImage from "./assets/AreaChart.light.svg";
import AreaChartLegend from "./assets/AreaChart-legend.light.svg";
import { AreaChartPreviewProps } from "../typings/AreaChartProps";

function Chart(props: AreaChartPreviewProps): React.ReactElement {
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
    const dropzone = <div style={{ minHeight: 38, position: "absolute", top: 10, right: 10, minWidth: 116 }} />;
    return (
        <div style={{ display: "inline-flex", flexFlow: "column nowrap", position: "relative" }}>
            <Chart {...props} />
            <PlaygroundSlog caption="Playground slot">{dropzone}</PlaygroundSlog>
        </div>
    );
}
