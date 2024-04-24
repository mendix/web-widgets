import { useState, useReducer, useEffect } from "react";
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
