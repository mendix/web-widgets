import { ChartPreview } from "@mendix/shared-charts/preview";
import { createElement, ReactNode } from "react";
import TimeSeries from "./assets/TimeSeries.light.svg";
import TimeSeriesRange from "./assets/TimeSeries-range.light.svg";
import TimeSeriesLegend from "./assets/TimeSeries-legend.light.svg";
import { TimeSeriesPreviewProps } from "../typings/TimeSeriesProps";

export function preview(props: TimeSeriesPreviewProps): ReactNode {
    const { showRangeSlider } = props;
    const TimeSeriesImage = showRangeSlider ? TimeSeriesRange : TimeSeries;
    return (
        <ChartPreview
            {...props}
            image={<ChartPreview.PlotImage src={TimeSeriesImage} alt="Bubble chart" />}
            legend={<ChartPreview.PlotLegend src={TimeSeriesLegend} alt="Legend" />}
        />
    );
}
