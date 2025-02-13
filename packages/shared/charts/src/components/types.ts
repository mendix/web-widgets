import { ObjectItem } from "mendix";
import { Config, Data, Layout } from "plotly.js-dist-min";

declare module "plotly.js-dist-min" {
    interface PlotDatum {
        /** This array appears on only when aggregation is used */
        pointIndices?: number[];
        pointNumbers?: number[];
    }
}
export type ExtraTraceProps = {
    /** Objects used to get 'trace' values. */
    dataSourceItems: ObjectItem[];
    /** JSON string. Expected to be an object with custom 'trace' options. */
    customSeriesOptions: string | undefined;
    /** Click handler for each point on current 'trace'. Should be call with ObjectItem associated with clicked point. */
    onClick?: (item: ObjectItem) => void;
};

export type PlotTrace = Partial<Data> & ExtraTraceProps;

export interface ChartViewProps {
    data: PlotTrace[];
    configOptions: Partial<Config>;
    layoutOptions: Partial<Layout>;
    seriesOptions: Partial<Data>;
    customConfig: string | undefined;
    customLayout: string | undefined;
}

export interface ChartProps extends ChartViewProps {
    playground: React.ReactNode | null;
}
