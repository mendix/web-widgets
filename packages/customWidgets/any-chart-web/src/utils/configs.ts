import { Config, Layout, Transform } from "plotly.js";
import * as deepMerge from "deepmerge";
import { Data } from "./namespaces";

export const configs: SharedConfigs = {
    layout: {
        font: {
            family: "Open Sans",
            size: 14,
            color: "#555"
        },
        autosize: true,
        hovermode: "closest",
        hoverlabel: {
            bgcolor: "#888",
            bordercolor: "#888",
            font: {
                color: "#FFF"
            }
        },
        margin: {
            l: 60,
            r: 60,
            b: 60,
            t: 60,
            pad: 10
        }
    },
    configuration: { displayModeBar: false, doubleClick: false }
};

export const fetchThemeConfigs = (type: ChartType): Promise<ChartConfigs> =>
    new Promise<ChartConfigs>((resolve, reject) => {
        try {
            const cacheBurst = window.dojoConfig.cacheBust;
            window
                .fetch(`${window.mx.remoteUrl}com.mendix.charts.json?${cacheBurst}`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }

                    return { layout: {}, configuration: {} };
                })
                .then(themeConfigs => {
                    resolve(processChartConfigs(type, themeConfigs));
                })
                .catch(error => {
                    console.log("An error occurred while fetching theme configs", error); // tslint:disable-line
                    reject(error);
                });
        } catch (e) {
            console.log("An error occurred while fetching theme configs", e); // tslint:disable-line
            reject(e);
        }
    });

export const processChartConfigs = (type: ChartType, themeConfigs: ThemeConfigs): ChartConfigs => {
    const sharedLayout = themeConfigs.layout || {};
    const sharedConfiguration = themeConfigs.configuration || {};
    const { charts } = themeConfigs;
    if (charts) {
        const chartConfigs = (charts as any)[type];

        return {
            layout: deepMerge.all([sharedLayout, (chartConfigs && chartConfigs.layout) || {}]),
            configuration: deepMerge.all([sharedConfiguration, (chartConfigs && chartConfigs.configuration) || {}]),
            data: (chartConfigs && chartConfigs.data) || {}
        };
    }

    return { layout: sharedLayout, configuration: sharedConfiguration, data: {} };
};

export const arrayOverwrite = (_destinationArray: any[], sourceArray: any[]) => sourceArray;

export type ChartType =
    | "LineChart"
    | "BubbleChart"
    | "PieChart"
    | "HeatMap"
    | "AnyChart"
    | "PolarChart"
    | "BarChart"
    | "AreaChart"
    | "TimeSeries"
    | "ColumnChart";

interface SharedConfigs {
    layout: Partial<Layout>;
    configuration: Partial<Config>;
}

export type ChartConfigs = SharedConfigs & { data: Partial<{}> };
export interface ThemeConfigs extends SharedConfigs {
    charts?: {
        LineChart?: ChartConfigs;
        BarChart?: ChartConfigs;
        ColumnChart?: ChartConfigs;
        TimeSeries?: ChartConfigs;
        AreaChart?: ChartConfigs;
        PieChart?: ChartConfigs;
        PolarChart?: ChartConfigs;
        HeatMap?: ChartConfigs;
        BubbleChart?: ChartConfigs;
    };
}

export const getTransforms = (series: Data.SeriesProps, traces: Data.ScatterTrace): Transform[] | undefined => {
    const { aggregationType } = series;
    if (aggregationType !== "none" && traces) {
        return [
            {
                type: "aggregate",
                groups: traces.x,
                aggregations: [
                    {
                        target: "y",
                        func: aggregationType,
                        enabled: true
                    }
                ]
            } as Transform
        ];
    }

    return undefined;
};
