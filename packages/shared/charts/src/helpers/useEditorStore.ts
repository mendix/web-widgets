import { useState, useReducer, useEffect } from "react";
import { EditorStore } from "./EditorStore";

type Params = {
    dataLength: number;
};

export function useEditorStore(params: Params): EditorStore {
    const [, forceUpdate] = useReducer(n => n + 1, 0);
    const [store] = useState(() => {
        const store = new EditorStore();

        store.addListener(forceUpdate);

        return store;
    });

    useEffect(() => {
        store.resetData(params.dataLength);
    }, [store, params.dataLength]);

    return store;
}
