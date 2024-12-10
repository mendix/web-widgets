import { ReactElement, createElement, useEffect, useRef, useState } from "react";
import { AnyChartContainerProps } from "../typings/AnyChartProps";
import { PlotlyChart } from "./components/PlotlyChart";
import { ChartDataProcessor } from "./utils/ChartDataProcessor";

export default function AnyChart(props: AnyChartContainerProps): ReactElement {
    const chartRef = useRef<HTMLDivElement>(null);
    const [chart, setChart] = useState<PlotlyChart | null>(null);
    const [containerDimensions, setContainerDimensions] = useState<{ width?: number; height?: number }>({});
    const dataProcessor = useRef(new ChartDataProcessor());

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            setContainerDimensions({ width, height });
        });

        if (chartRef.current) {
            resizeObserver.observe(chartRef.current);
        }

        return () => {
            resizeObserver.disconnect();
            if (chart) {
                chart.destroy();
            }
        };
    }, [chart]);

    useEffect(() => {
        if (!chartRef.current || !containerDimensions.width) {
            return;
        }

        const data = dataProcessor.current.parseData(props.dataStatic, props.dataAttribute?.value, props.sampleData);

        const layout = dataProcessor.current.parseLayout(
            props.layoutStatic,
            props.layoutAttribute?.value,
            props.sampleLayout
        );

        const config = dataProcessor.current.parseConfig(props.configurationOptions);

        const { width, height } = dataProcessor.current.calculateDimensions(
            props.widthUnit,
            props.width,
            props.heightUnit,
            props.height,
            containerDimensions.width,
            containerDimensions.height
        );

        if (!chart) {
            const newChart = new PlotlyChart(chartRef.current, {
                data,
                layout: { ...layout, width, height },
                config: {
                    ...config,
                    displayModeBar: props.devMode === "developer"
                },
                width,
                height
            });
            setChart(newChart);
        } else {
            chart.update({
                data,
                layout: { ...layout, width, height },
                config: {
                    ...config,
                    displayModeBar: props.devMode === "developer"
                },
                width,
                height
            });
        }
    }, [
        props.dataStatic,
        props.dataAttribute?.value,
        props.sampleData,
        props.layoutStatic,
        props.layoutAttribute?.value,
        props.sampleLayout,
        props.configurationOptions,
        props.widthUnit,
        props.width,
        props.heightUnit,
        props.height,
        props.devMode,
        containerDimensions,
        chart
    ]);

    return (
        <div
            ref={chartRef}
            style={{
                width: props.widthUnit === "percentage" ? `${props.width}%` : `${props.width}px`,
                height: props.heightUnit === "percentageOfParent" ? `${props.height}%` : undefined
            }}
            tabIndex={props.tabIndex}
        />
    );
}
