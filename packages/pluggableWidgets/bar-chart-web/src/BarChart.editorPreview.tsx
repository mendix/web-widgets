import { ReactNode } from "react";
import { ChartPreview } from "@mendix/shared-charts/preview";
import BarChartGrouped from "./assets/BarChart-grouped.light.svg";
import BarChartLegend from "./assets/BarChart-legend.light.svg";
import BarChartStacked from "./assets/BarChart-stacked.light.svg";
import { BarChartPreviewProps } from "../typings/BarChartProps";

export function preview(props: BarChartPreviewProps): ReactNode {
    const BarChartImage = props.barmode === "group" ? BarChartGrouped : BarChartStacked;
    return (
        <ChartPreview
            {...props}
            image={<ChartPreview.PlotImage src={BarChartImage} alt="Bubble chart" />}
            legend={<ChartPreview.PlotLegend src={BarChartLegend} alt="Legend" />}
        />
    );
}
