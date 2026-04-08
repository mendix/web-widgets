import { useCallback, useMemo, useState } from "react";
import { PlaygroundDataV2 } from "@mendix/shared-charts/main";
import { ComposedEditorProps } from "../components/ComposedEditor";
import { SelectOption } from "../components/Sidebar";

type ConfigKey = "layout" | "config" | number;

const irrelevantSeriesKeys = ["x", "y", "z", "customSeriesOptions", "dataSourceItems"];

function getEditorCode({ store }: PlaygroundDataV2, key: ConfigKey): string {
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

export function useV2EditorController(data: PlaygroundDataV2): ComposedEditorProps {
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

    const store = data.store;
    const onEditorChange = useCallback(
        (value: string): void => {
            try {
                if (key === "layout") {
                    store.setLayout(JSON.parse(value));
                } else if (key === "config") {
                    store.setConfig(JSON.parse(value));
                } else {
                    store.setDataAt(key, value);
                }
                // eslint-disable-next-line no-empty
            } catch {}
        },
        [store, key]
    );

    return {
        viewSelectValue: key.toString(),
        viewSelectOptions: options,
        onViewSelectChange,
        value: getEditorCode(data, key),
        modelerCode: useMemo(() => JSON.stringify(getModelerCode(data, key), null, 2), [data, key]),
        onEditorChange
    };
}
