import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { CustomChartContainerProps } from "../../typings/CustomChartProps";
import { PlotlyChart, ChartProps } from "../components/PlotlyChart";
import { ChartDataProcessor } from "../utils/ChartDataProcessor";

interface UseCustomChartReturn {
    chartRef: RefObject<HTMLDivElement>;
    containerStyle: {
        width?: string;
        height?: string;
    };
}

export function useCustomChart(props: CustomChartContainerProps): UseCustomChartReturn {
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

    const [updateChartDebounced, abortChartUpdate] = useMemo(
        () =>
            debounce((chartInstance: PlotlyChart | null, updateData: ChartProps) => {
                if (!chartInstance) {
                    const newChart = new PlotlyChart(chartRef.current!, updateData);
                    setChart(newChart);
                } else {
                    chartInstance.update(updateData);
                }
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

        const dimensions = dataProcessor.current.calculateDimensions(
            props.widthUnit,
            props.width,
            props.heightUnit,
            props.height,
            containerDimensions.width,
            containerDimensions.height
        );

        const { width, height } = dimensions;

        const updateData: ChartProps = {
            data,
            layout: {
                ...layout,
                width,
                height,
                autosize: true,
                font: {
                    family: "Open Sans, sans-serif",
                    size: Math.max(12 * (width / 1000), 8)
                },
                legend: {
                    ...layout.legend,
                    font: {
                        ...layout.legend?.font,
                        size: Math.max(10 * (width / 1000), 7)
                    },
                    itemwidth: Math.max(10 * (width / 1000), 3)
                },
                xaxis: {
                    ...layout.xaxis,
                    tickfont: {
                        ...layout.xaxis?.tickfont,
                        size: Math.max(10 * (width / 1000), 7)
                    }
                },
                yaxis: {
                    ...layout.yaxis,
                    tickfont: {
                        ...layout.yaxis?.tickfont,
                        size: Math.max(10 * (width / 1000), 7)
                    }
                },
                margin: {
                    ...layout.margin,
                    l: Math.max(50 * (width / 1000), 30),
                    r: Math.max(50 * (width / 1000), 30),
                    t: Math.max(50 * (width / 1000), 30),
                    b: Math.max(50 * (width / 1000), 30),
                    pad: Math.max(4 * (width / 1000), 2)
                }
            },
            config: {
                ...dataProcessor.current.parseConfig(props.configurationOptions),
                displayModeBar: props.devMode === "developer",
                responsive: true
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

    return {
        chartRef,
        containerStyle: {
            width: props.widthUnit === "percentage" ? `${props.width}%` : `${props.width}px`,
            height: props.heightUnit === "percentageOfParent" ? `${props.height}%` : undefined
        }
    };
}
