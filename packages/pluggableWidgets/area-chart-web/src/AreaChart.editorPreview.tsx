import { ChartPreview } from "@mendix/shared-charts/preview";
import { ReactElement } from "react";
import { AreaChartPreviewProps } from "../typings/AreaChartProps";
import AreaChartLegend from "./assets/AreaChart-legend.light.svg";
import AreaChartImage from "./assets/AreaChart.light.svg";

export function preview(props: AreaChartPreviewProps): ReactElement {
    return (
        <ChartPreview
            {...props}
            image={<ChartPreview.PlotImage src={AreaChartImage} alt="Bubble chart" />}
            legend={<ChartPreview.PlotLegend src={AreaChartLegend} alt="Legend" />}
        />
    );
}
