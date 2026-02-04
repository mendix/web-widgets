import { Data } from "plotly.js-dist-min";
import { useEffect, useReducer, useRef, useState } from "react";
import { fallback, pprint } from "../utils/json";
import { EditorStore, EditorStoreState } from "./EditorStore";

export type EditorStoreInitializer = () => EditorStoreState;

type Params = {
    dataLength: number;
    dataSourceKey?: Data[];
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

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (params.initState) {
            const state = params.initState();
            store.reset(state);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store, params.dataSourceKey]);

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
