import { useMemo } from "react";
import { ChartProps } from "../components/types";
import { useEditorStore, EditorStoreInitializer } from "./useEditorStore";
import { usePlaygroundDataFactory, PlaygroundData } from "./playground-context";
import { fallback, pprint } from "../utils/json";
import { EditorStoreState } from "./EditorStore";

type Params = {
    playgroundOn: boolean;
};

export function useChartController(props: ChartProps, params: Params): [ChartProps, PlaygroundData] {
    const { playgroundOn } = params;
    const store = useEditorStore({
        dataLength: props.data.length,
        initState: initStateFromProps(props)
    });
    const playgroundContext = usePlaygroundDataFactory(props, store);
    const { state } = store;
    props = useMemo(() => (playgroundOn === false ? props : mergeConfigs(props, state)), [playgroundOn, props, state]);

    return [props, playgroundContext];
}

export function initStateFromProps(props: ChartProps): EditorStoreInitializer {
    return () => ({
        layout: pprint(fallback(props.customLayout)),
        config: pprint(fallback(props.customConfig)),
        data: props.data.map(trace => pprint(fallback(trace.customSeriesOptions)))
    });
}

function mergeConfigs(props: ChartProps, state: EditorStoreState): ChartProps {
    return {
        ...props,
        customConfig: state.config,
        customLayout: state.layout,
        data: props.data.map((trace, index) => ({ ...trace, customSeriesOptions: state.data[index] }))
    };
}
