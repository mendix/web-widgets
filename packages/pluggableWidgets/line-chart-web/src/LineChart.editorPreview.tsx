import { ChartPreview } from "@mendix/shared-charts/preview";
import { createElement, ReactNode } from "react";
import { LineChartPreviewProps } from "../typings/LineChartProps";
import LineChartLegend from "./assets/LineChart-legend.light.svg";
import LineChartImage from "./assets/LineChart.light.svg";

export function preview(props: LineChartPreviewProps): ReactNode {
    return (
        <ChartPreview
            {...props}
            image={<ChartPreview.PlotImage src={LineChartImage} alt="Bubble chart" />}
            legend={<ChartPreview.PlotLegend src={LineChartLegend} alt="Legend" />}
        />
    );
}
