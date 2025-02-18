import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { Config, Data, Layout } from "plotly.js-dist-min";
import { CSSProperties, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { CustomChartContainerProps } from "../../typings/CustomChartProps";
import { ChartProps, PlotlyChart } from "../components/PlotlyChart";
import { parseConfig, parseData, parseLayout } from "../utils/utils";

interface UseCustomChartReturn {
    chartRef: RefObject<HTMLDivElement>;
    containerStyle: CSSProperties;
    data: Array<Partial<Data>>;
    layout: Partial<Layout>;
    config: Partial<Config>;
}

export function useCustomChart(props: CustomChartContainerProps): UseCustomChartReturn {
    const chartRef = useRef<HTMLDivElement>(null);
    const [chart, setChart] = useState<PlotlyChart | null>(null);
    const [containerDimensions, setContainerDimensions] = useState<{ width?: number; height?: number }>({});
    const [chartData, setChartData] = useState<Array<Partial<Data>>>();
    const [chartLayout, setChartLayout] = useState<Partial<Layout>>();
    const [chartConfig, setChartConfig] = useState<Partial<Config>>();

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

        const data = parseData(props.dataStatic, props.dataAttribute?.value, props.sampleData);
        const layout = parseLayout(props.layoutStatic, props.layoutAttribute?.value, props.sampleLayout);
        const config = parseConfig(props.configurationOptions);
        setChartData(data);
        setChartLayout(layout);
        setChartConfig(config);

        const dimensions = {
            width: containerDimensions.width ?? 0,
            height: containerDimensions.height ?? 0
        };

        const updateData: ChartProps = {
            data,
            onClick: (data: any) => {
                if (props.eventDataAttribute) {
                    // TODO: value has to be set to correct value (possibly data.points)
                    props.eventDataAttribute?.setValue(JSON.stringify(data.points[0].bbox));
                } else {
                    // if event attribute not set, directly trigger actions.
                    executeAction(props.onClick);
                }
            },
            layout: {
                ...layout,
                width: dimensions.width,
                height: dimensions.height,
                autosize: true,
                font: {
                    family: "Open Sans, sans-serif",
                    size: Math.max(12 * (dimensions.width / 1000), 8)
                },
                legend: {
                    ...layout.legend,
                    font: {
                        ...layout.legend?.font,
                        size: Math.max(10 * (dimensions.width / 1000), 7)
                    },
                    itemwidth: Math.max(10 * (dimensions.width / 1000), 3),
                    itemsizing: "constant"
                },
                xaxis: {
                    ...layout.xaxis,
                    tickfont: {
                        ...layout.xaxis?.tickfont,
                        size: Math.max(10 * (dimensions.width / 1000), 7)
                    }
                },
                yaxis: {
                    ...layout.yaxis,
                    tickfont: {
                        ...layout.yaxis?.tickfont,
                        size: Math.max(10 * (dimensions.width / 1000), 7)
                    }
                },
                margin: {
                    ...layout.margin,
                    l: Math.max(50 * (dimensions.width / 1000), 30),
                    r: Math.max(50 * (dimensions.width / 1000), 30),
                    t: Math.max(50 * (dimensions.width / 1000), 30),
                    b: Math.max(50 * (dimensions.width / 1000), 30),
                    pad: Math.max(4 * (dimensions.width / 1000), 2)
                }
            },
            config: {
                ...config,
                responsive: true
            },
            width: dimensions.width,
            height: dimensions.height
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
        },
        data: chartData ?? [],
        layout: chartLayout ?? {},
        config: chartConfig ?? {}
    };
}
