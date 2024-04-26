import { ChartPreview } from "@mendix/shared-charts/preview";
import { createElement, ReactNode } from "react";
import PieChart from "./assets/PieChart.light.svg";
import DoughnutChart from "./assets/DoughnutChart.light.svg";
import PieChartLegend from "./assets/PieDoughnut-legend.light.svg";
import { PieChartPreviewProps } from "../typings/PieChartProps";

export function preview(props: PieChartPreviewProps): ReactNode {
    const { holeRadius } = props;
    const PieChartImage = holeRadius && holeRadius > 0 ? DoughnutChart : PieChart;
    return (
        <ChartPreview
            {...props}
            image={<ChartPreview.PlotImage src={PieChartImage} alt="Bubble chart" />}
            legend={<ChartPreview.PlotLegend src={PieChartLegend} alt="Legend" />}
        />
    );
}
