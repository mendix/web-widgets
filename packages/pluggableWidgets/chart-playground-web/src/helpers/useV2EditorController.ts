import { observable, reaction, runInAction } from "mobx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PlaygroundDataV2 } from "@mendix/shared-charts/main";
import { ComposedEditorProps } from "../components/ComposedEditor";
import { SelectOption } from "../components/Sidebar";

type ConfigKey = "layout" | "config" | number;

const irrelevantSeriesKeys = ["x", "y", "z", "customSeriesOptions", "dataSourceItems"];

function getEditorCode(store: PlaygroundDataV2["store"], key: ConfigKey): string {
    if (key === "layout") {
        return store.layoutJson ?? '{ "error": "value is unavailable" }';
    }
    if (key === "config") {
        return store.configJson ?? '{ "error": "value is unavailable" }';
    }
    return store.dataJson.at(key) ?? '{ "error": "value is unavailable" }';
}

function getModelerCode(data: PlaygroundDataV2, key: ConfigKey): object {
    if (key === "layout") {
        return data.layoutOptions;
    }
    if (key === "config") {
        return data.configOptions;
    }
    const entries = Object.entries(data.plotData.at(key) ?? {}).filter(([k]) => !irrelevantSeriesKeys.includes(k));
    return Object.fromEntries(entries);
}

function prettifyJson(json: string): string {
    try {
        return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
        return '{ "error": "invalid JSON" }';
    }
}

export function useV2EditorController(context: PlaygroundDataV2): ComposedEditorProps {
    const [key, setKey] = useState<ConfigKey>("layout");
    const keyBox = useState(() => observable.box<ConfigKey>(key))[0];

    const onViewSelectChange = (value: string): void => {
        let newKey: ConfigKey;
        if (value === "layout" || value === "config") {
            newKey = value;
        } else {
            const n = parseInt(value, 10);
            newKey = isNaN(n) ? "layout" : n;
        }
        setKey(newKey);
        runInAction(() => keyBox.set(newKey));
    };

    const store = context.store;

    const options: SelectOption[] = useMemo(() => {
        return [
            { name: "Layout", value: "layout", isDefaultSelected: true },
            ...store.data.map((trace, index) => ({
                name: (trace.name as string) || `trace ${index}`,
                value: index,
                isDefaultSelected: false
            })),
            { name: "Configuration", value: "config", isDefaultSelected: false }
        ];
    }, [store.data]);

    const code = prettifyJson(getEditorCode(store, key));
    const [input, setInput] = useState(() => code);
    const onEditorChange = useCallback(
        (value: string): void => {
            setInput(value);
            try {
                // Parse string before sending to store
                const obj = JSON.parse(value);
                if (key === "layout") {
                    store.setLayout(obj);
                } else if (key === "config") {
                    store.setConfig(obj);
                } else {
                    store.setDataAt(key, value);
                }
                // eslint-disable-next-line no-empty
            } catch {}
        },
        [store, key]
    );

    useEffect(
        () =>
            reaction(
                () => getEditorCode(store, keyBox.get()),
                code => setInput(prettifyJson(code))
            ),
        [store, keyBox]
    );

    return {
        viewSelectValue: key.toString(),
        viewSelectOptions: options,
        onViewSelectChange,
        value: input,
        modelerCode: useMemo(() => JSON.stringify(getModelerCode(context, key), null, 2), [context, key]),
        onEditorChange
    };
}
