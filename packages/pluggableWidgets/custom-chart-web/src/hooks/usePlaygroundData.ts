import { EditorStoreInitializer, fallback, PlaygroundData, pprint, useEditorStore } from "@mendix/shared-charts/main";
import { Config, Data, Layout } from "plotly.js-dist-min";

type UsePlaygroundDataProps = {
    data: Partial<Data>[];
    layout: Partial<Layout>;
    config: Partial<Config>;
};

export function usePlaygroundData(props: UsePlaygroundDataProps): PlaygroundData {
    const store = useEditorStore({
        dataLength: props.data?.length ?? 0,
        initState: initStateFromProps(props.data)
    });

    const playgroundData: PlaygroundData = {
        store,
        layoutOptions: props.layout,
        configOptions: props.config,
        plotData: props.data
    };

    return playgroundData;
}

function initStateFromProps(data: Partial<Data>[]): EditorStoreInitializer {
    return () => ({
        layout: pprint(fallback("")),
        config: pprint(fallback("")),
        data: data.map(trace => pprint(fallback(trace.name)))
    });
}
