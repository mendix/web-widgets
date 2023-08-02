import { ObjectItem } from "mendix";
export { Annotations as ChartAnnotation } from "plotly.js";

export type ExtraTraceProps = {
    /** Objects used to get 'trace' values. */
    dataSourceItems: ObjectItem[];
    /** JSON string. Expected to be an object with custom 'trace' options. */
    customSeriesOptions: string | undefined;
    /** Click handler for each point on current 'trace'. Should be call with ObjectItem associated with clicked point. */
    onClick?: (item: ObjectItem) => void;
};
