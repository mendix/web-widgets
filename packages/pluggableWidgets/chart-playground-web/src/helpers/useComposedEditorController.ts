import { PlaygroundData, fallback } from "@mendix/shared-charts/main";
import { EditorChangeHandler } from "../components/CodeEditor";
import { useMemo, useState } from "react";
import { ComposedEditorProps } from "../components/ComposedEditor";
import { SelectOption } from "../components/Sidebar";

type Config = object;

type Data = object;

type Layout = object;

const irrelevantSeriesKeys = ["x", "y", "z", "customSeriesOptions", "dataSourceItems"];

type ConfigKey = "layout" | "config" | number;

function getEditorCode({ store }: PlaygroundData, key: ConfigKey): string {
    let value = typeof key === "number" ? store.state.data.at(key) : store.state[key];
    value = value ?? '{ "error": "value is unavailable" }';
    return value;
}

function getModelerCode(data: PlaygroundData, key: ConfigKey): Partial<Data> | Partial<Layout> | Partial<Config> {
    if (key === "layout") {
        return data.layoutOptions;
    }
    if (key === "config") {
        return data.configOptions;
    }

    const entries = Object.entries(data.plotData.at(key) ?? {}).filter(([key]) => !irrelevantSeriesKeys.includes(key));
    return Object.fromEntries(entries) as Partial<Data>;
}

export function useComposedEditorController(data: PlaygroundData): ComposedEditorProps {
    const [key, setKey] = useState<ConfigKey>("layout");

    const onViewSelectChange = (value: string): void => {
        if (value === "layout" || value === "config") {
            setKey(value);
        } else {
            const n = parseInt(value, 10);
            setKey(isNaN(n) ? "layout" : n);
        }
    };

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

    const onEditorChange: EditorChangeHandler = (json): void => {
        json = fallback(json);
        try {
            JSON.parse(json);
            data.store.set(key, json);
            // eslint-disable-next-line no-empty
        } catch {}
    };

    return {
        viewSelectValue: key.toString(),
        viewSelectOptions: options,
        onViewSelectChange,
        defaultEditorValue: getEditorCode(data, key),
        modelerCode: useMemo(() => JSON.stringify(getModelerCode(data, key), null, 2), [data, key]),
        onEditorChange
    };
}
