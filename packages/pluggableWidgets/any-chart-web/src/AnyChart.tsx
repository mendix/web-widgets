import { ReactElement, createElement, useEffect, useRef, useState, useMemo } from "react";
import { AnyChartContainerProps } from "../typings/AnyChartProps";
import { PlotlyChart } from "./components/PlotlyChart";
import { ChartDataProcessor } from "./utils/ChartDataProcessor";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";

export default function AnyChart(props: AnyChartContainerProps): ReactElement {
    const chartRef = useRef<HTMLDivElement>(null);
    const [chart, setChart] = useState<PlotlyChart | null>(null);
    const [containerDimensions, setContainerDimensions] = useState<{ width?: number; height?: number }>({});
    const dataProcessor = useRef(new ChartDataProcessor());

    const [setContainerDimensionsDebounced, abortDimensionsDebounce] = useMemo(
        () =>
            debounce((width: number, height: number) => {
                setContainerDimensions({ width, height });
            }, 100),
        []
    );

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            setContainerDimensionsDebounced(width, height);
        });

        if (chartRef.current) {
            resizeObserver.observe(chartRef.current);
        }

        return () => {
            resizeObserver.disconnect();
            abortDimensionsDebounce();
            if (chart) {
                chart.destroy();
            }
        };
    }, [chart, setContainerDimensionsDebounced, abortDimensionsDebounce]);

    const [updateChartDebounced, abortChartUpdate] = useMemo(
        () =>
            debounce(
                (
                    chartInstance: PlotlyChart | null,
                    updateData: {
                        data: any;
                        layout: any;
                        config: any;
                        width: number;
                        height: number;
                    }
                ) => {
                    if (!chartInstance) {
                        const newChart = new PlotlyChart(chartRef.current!, updateData);
                        setChart(newChart);
                    } else {
                        chartInstance.update(updateData);
                    }
                },
                100
            ),
        []
    );

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

        const updateData = {
            data,
            layout: { ...layout, width, height },
            config: {
                ...config,
                displayModeBar: props.devMode === "developer"
            },
            width,
            height
        };

        updateChartDebounced(chart, updateData);

        return () => {
            abortChartUpdate();
        };
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
        chart,
        updateChartDebounced,
        abortChartUpdate
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
