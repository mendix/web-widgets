import { useMemo } from "react";
import { ChartProps } from "../components/types";
import { EditorStoreState } from "./EditorStore";
import { useEditorStore } from "./useEditorStore";
import { usePlaygroundDataFactory, PlaygroundData } from "./playground-context";
import { fallback } from "../utils/json";

type Params = {
    playgroundOn: boolean;
};

export function useChartController(props: ChartProps, params: Params): [ChartProps, PlaygroundData] {
    const { playgroundOn } = params;
    const store = useEditorStore({
        dataLength: props.data.length,
        initState: () => ({
            layout: fallback(props.customLayout),
            config: fallback(props.customConfig),
            data: props.data.map(trace => fallback(trace.customSeriesOptions))
        })
    });
    const playgroundContext = usePlaygroundDataFactory(props, store);
    const { state } = store;
    props = useMemo(() => (playgroundOn === false ? props : mergeConfigs(props, state)), [playgroundOn, props, state]);

    return [props, playgroundContext];
}

function mergeConfigs(props: ChartProps, state: EditorStoreState): ChartProps {
    return {
        ...props,
        customConfig: state.config,
        customLayout: state.layout,
        data: props.data.map((trace, index) => ({ ...trace, customSeriesOptions: state.data[index] }))
    };
}
