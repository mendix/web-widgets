import { ReactElement } from "react";
import { Config, Data, Layout } from "plotly.js";
export interface MendixChartDataProps {
    customSeriesOptions: string | undefined;
    onClick?: () => void;
}
declare type ChartDataType = Partial<Data> & MendixChartDataProps;
export interface ChartProps {
    data: ChartDataType[];
    configOptions: Partial<Config>;
    layoutOptions: Partial<Layout>;
    seriesOptions: Partial<Data>;
    customConfig: string | undefined;
    customLayout: string | undefined;
}
export declare const Chart: ({
    data,
    configOptions,
    layoutOptions,
    seriesOptions,
    customConfig,
    customLayout
}: ChartProps) => ReactElement;
export declare const ChartWithPlayground: ({
    data,
    layoutOptions,
    configOptions,
    seriesOptions,
    customLayout,
    customConfig
}: ChartProps) => ReactElement;
export {};
//# sourceMappingURL=Chart.d.ts.map
