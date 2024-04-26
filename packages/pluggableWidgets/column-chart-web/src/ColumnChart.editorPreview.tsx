import { ChartPreview } from "@mendix/shared-charts/preview";
import { createElement, ReactNode } from "react";
import ColumnChartGrouped from "./assets/ColumnChart-grouped.light.svg";
import ColumnChartStacked from "./assets/ColumnChart-stacked.light.svg";
import ColumnChartLegend from "./assets/ColumnChart-legend.light.svg";
import { ColumnChartPreviewProps } from "../typings/ColumnChartProps";

export function preview(props: ColumnChartPreviewProps): ReactNode {
    const ColumnChartImage = props.barmode === "group" ? ColumnChartGrouped : ColumnChartStacked;
    return (
        <ChartPreview
            {...props}
            image={<ChartPreview.PlotImage src={ColumnChartImage} alt="Bubble chart" />}
            legend={<ChartPreview.PlotLegend src={ColumnChartLegend} alt="Legend" />}
        />
    );
}
