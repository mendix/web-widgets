import { ChartPreview } from "@mendix/shared-charts/preview";
import { ReactElement } from "react";
import { BubbleChartPreviewProps } from "../typings/BubbleChartProps";
import BubbleChartLegend from "./assets/BubbleChart-legend.light.svg";
import BubbleChartImage from "./assets/BubbleChart.light.svg";

export function preview(props: BubbleChartPreviewProps): ReactElement {
    return (
        <ChartPreview
            {...props}
            image={<ChartPreview.PlotImage src={BubbleChartImage} alt="Bubble chart" />}
            legend={<ChartPreview.PlotLegend src={BubbleChartLegend} alt="Legend" />}
        />
    );
}
