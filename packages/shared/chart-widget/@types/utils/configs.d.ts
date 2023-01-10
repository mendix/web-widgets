import { Config, Data, Layout } from "plotly.js";
export declare const defaultConfigs: SharedConfigs;
interface SharedConfigs {
    layout: Partial<Layout>;
    configuration: Partial<Config>;
    series: Partial<Data>;
}
export declare const getModelerLayoutOptions: (...customLayouts: Array<Partial<Layout>>) => Partial<Layout>;
export declare const getModelerConfigOptions: (...customConfigs: Array<Partial<Config>>) => Partial<Config>;
export declare const getModelerSeriesOptions: (...customSeries: Array<Partial<Data>>) => Partial<Data>;
export interface CustomLayoutProps {
    showLegend: Layout["showlegend"];
    xAxisLabel: Layout["xaxis"]["title"];
    yAxisLabel: Layout["yaxis"]["title"];
    gridLinesMode: "horizontal" | "vertical" | "none" | "both";
}
export declare const getCustomLayoutOptions: ({
    showLegend,
    xAxisLabel,
    gridLinesMode,
    yAxisLabel
}: CustomLayoutProps) => Partial<Layout>;
export declare type ChartTypeEnum =
    | "LineChart"
    | "AreaChart"
    | "BubbleChart"
    | "TimeSeries"
    | "ColumnChart"
    | "BarChart"
    | "PieChart"
    | "HeatMap";
export declare const useThemeFolderConfigs: (chartType: ChartTypeEnum, enabled: boolean) => SharedConfigs;
export {};
//# sourceMappingURL=configs.d.ts.map
