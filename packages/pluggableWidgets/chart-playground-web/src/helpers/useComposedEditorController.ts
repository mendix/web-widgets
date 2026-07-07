import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fallback, PlaygroundDataV1 } from "@mendix/shared-charts/main";
import { isEquivalentJson, prettifyJson } from "./editorJson";
import { ComposedEditorProps } from "../components/ComposedEditor";
import { SelectOption } from "../components/Sidebar";

type Config = object;

type Data = object;

type Layout = object;

const irrelevantSeriesKeys = ["x", "y", "z", "customSeriesOptions", "dataSourceItems"];

type ConfigKey = "layout" | "config" | number;

function getEditorCode({ store }: PlaygroundDataV1, key: ConfigKey): string {
    let value = typeof key === "number" ? store.state.data.at(key) : store.state[key];
    value = value ?? '{ "error": "value is unavailable" }';
    return value;
}

function getModelerCode(data: PlaygroundDataV1, key: ConfigKey): Partial<Data> | Partial<Layout> | Partial<Config> {
    if (key === "layout") {
        return data.layoutOptions;
    }
    if (key === "config") {
        return data.configOptions;
    }

    const entries = Object.entries(data.plotData.at(key) ?? {}).filter(([key]) => !irrelevantSeriesKeys.includes(key));
    return Object.fromEntries(entries) as Partial<Data>;
}

export function useComposedEditorController(data: PlaygroundDataV1): ComposedEditorProps {
    const [key, setKey] = useState<ConfigKey>("layout");

    const onViewSelectChange = useCallback((value: string): void => {
        if (value === "layout" || value === "config") {
            setKey(value);
        } else {
            const n = parseInt(value, 10);
            setKey(isNaN(n) ? "layout" : n);
        }
    }, []);

    const options: SelectOption[] = useMemo(() => {
        return [
            { name: "Layout", value: "layout", isDefaultSelected: true },
            ...data.plotData.map((trace, index) => ({
                name: trace.name || `trace ${index}`,
                value: index,
                isDefaultSelected: false
            })),
            { name: "Configuration", value: "config", isDefaultSelected: false }
        ];
    }, [data.plotData]);

    const store = data.store;
    const code = prettifyJson(getEditorCode(data, key));
    const [input, setInput] = useState(() => code);
    const lastOwnEditRef = useRef<string | null>(null);
    const onEditorChange = useCallback(
        (value: string): void => {
            setInput(value);
            try {
                const json = fallback(value);
                JSON.parse(value);
                lastOwnEditRef.current = json;
                store.set(key, json);
                // eslint-disable-next-line no-empty
            } catch {}
        },
        [store, key]
    );

    useEffect(() => {
        // Skip resync when `code` is just the store echoing back the user's own last edit —
        // otherwise every keystroke replaces the controlled value and resets the cursor to the end.
        if (lastOwnEditRef.current !== null && isEquivalentJson(code, lastOwnEditRef.current)) {
            lastOwnEditRef.current = null;
            return;
        }
        lastOwnEditRef.current = null;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInput(code);
    }, [code]);

    return {
        viewSelectValue: key.toString(),
        viewSelectOptions: options,
        onViewSelectChange,
        value: input,
        modelerCode: useMemo(() => JSON.stringify(getModelerCode(data, key), null, 2), [data, key]),
        onEditorChange
    };
}
