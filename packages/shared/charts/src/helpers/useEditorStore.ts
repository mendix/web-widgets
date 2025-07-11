import { Data } from "plotly.js-dist-min";
import { useEffect, useReducer, useState } from "react";
import { fallback, pprint } from "../utils/json";
import { EditorStore, EditorStoreState } from "./EditorStore";

export type EditorStoreInitializer = () => EditorStoreState;

type Params = {
    dataLength: number;
    initState?: EditorStoreInitializer;
};

export function useEditorStore(params: Params): EditorStore {
    const [, forceUpdate] = useReducer(n => n + 1, 0);
    const [store] = useState(() => {
        const store = new EditorStore();
        if (params.initState) {
            store.reset(params.initState());
        }

        store.addListener(forceUpdate);

        return store;
    });

    useEffect(
        () => () => {
            store.resetData(params.dataLength);
        },
        [store, params.dataLength]
    );

    return store;
}

export function initStateFromProps(data: Array<Partial<Data>>): EditorStoreInitializer {
    return () => ({
        layout: pprint(fallback("")),
        config: pprint(fallback("")),
        data: data.map(trace => pprint(JSON.stringify(trace)))
    });
}
