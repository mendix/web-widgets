import { ReactNode } from "react";
import { ChartPreview } from "@mendix/shared-charts/preview";
import HeatMapChartLegend from "./assets/HeatMap-legend.light.svg";
import HeatMapChartImage from "./assets/HeatMap.light.svg";
import { HeatMapPreviewProps } from "../typings/HeatMapProps";

export function preview(props: HeatMapPreviewProps): ReactNode {
    return (
        <ChartPreview
            {...props}
            showLegend={props.showScale}
            image={<ChartPreview.PlotImage src={HeatMapChartImage} alt="Bubble chart" />}
            legend={<ChartPreview.PlotLegend src={HeatMapChartLegend} alt="Legend" />}
        />
    );
}
