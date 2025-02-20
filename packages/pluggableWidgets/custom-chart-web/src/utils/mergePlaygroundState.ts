import { EditorStoreState } from "@mendix/shared-charts/main";
import { ChartProps } from "../components/PlotlyChart";
import { parseConfig, parseLayout } from "./utils";

export function mergePlaygroundState(props: ChartProps, state: EditorStoreState): ChartProps {
    return {
        ...props,
        config: {
            ...props.config,
            ...parseConfig(state.config)
        },
        layout: {
            ...props.layout,
            ...parseLayout(state.layout)
        },
        data: props.data.map((trace, index) => ({ ...trace, customSeriesOptions: state.data[index] }))
    };
}
