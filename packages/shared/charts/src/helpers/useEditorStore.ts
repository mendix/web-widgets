import { useState, useReducer, useEffect } from "react";
import { EditorStore, EditorStoreState } from "./EditorStore";

type Params = {
    dataLength: number;
    initState?: () => EditorStoreState;
};

export function useEditorStore(params: Params): EditorStore {
    const [, forceUpdate] = useReducer(n => n + 1, 0);
    const [store] = useState(() => {
        const store = new EditorStore();
        if (params.initState) {
            const init = params.initState();
            store.set("layout", init.layout);
            store.set("config", init.config);
            store.set("data", init.data);
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
