import { EditorStoreInitializer, fallback, PlaygroundData, pprint, useEditorStore } from "@mendix/shared-charts/main";
import { Config, Data, Layout } from "plotly.js-dist-min";
import { useMemo } from "react";

type UsePlaygroundDataProps = {
    data: Array<Partial<Data>>;
    layout: Partial<Layout>;
    config: Partial<Config>;
    playgroundOn: boolean;
};

export function usePlaygroundData(props: UsePlaygroundDataProps): PlaygroundData {
    const store = useEditorStore({
        dataLength: props.data?.length ?? 0,
        initState: initStateFromProps(props.data)
    });

    return useMemo<PlaygroundData>(
        () => ({
            store,
            layoutOptions: props.layout,
            configOptions: props.config,
            plotData: props.data
        }),
        [props.layout, props.config, props.data, store]
    );
}

function initStateFromProps(data: Array<Partial<Data>>): EditorStoreInitializer {
    return () => ({
        layout: pprint(fallback("")),
        config: pprint(fallback("")),
        data: data.map(trace => pprint(fallback(trace.name)))
    });
}
