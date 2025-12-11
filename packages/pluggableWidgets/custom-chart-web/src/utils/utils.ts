import { EditorStoreState } from "@mendix/shared-charts/main";
import deepmerge from "deepmerge";
import { Config, Data, Layout } from "plotly.js-dist-min";
import { ChartProps } from "../components/PlotlyChart";

// Custom merge options: arrays are replaced (not concatenated) to match Plotly expectations
const mergeOptions: deepmerge.Options = {
    arrayMerge: (_target, source) => source
};

export function parseData(staticData?: string, attributeData?: string, sampleData?: string): Data[] {
    try {
        const staticTraces: Data[] = staticData ? JSON.parse(staticData) : [];
        const attrTraces: Data[] = attributeData ? JSON.parse(attributeData) : [];

        // Use sampleData as fallback when attributeData is empty
        const dynamicTraces: Data[] = attrTraces.length > 0 ? attrTraces : sampleData ? JSON.parse(sampleData) : [];

        const maxLen = Math.max(staticTraces.length, dynamicTraces.length);
        const result: Data[] = [];

        for (let i = 0; i < maxLen; i++) {
            const staticTrace = (staticTraces[i] ?? {}) as Record<string, unknown>;
            const dynamicTrace = (dynamicTraces[i] ?? {}) as Record<string, unknown>;
            result.push(deepmerge(staticTrace, dynamicTrace, mergeOptions) as Data);
        }

        return result;
    } catch (error) {
        console.error("Error parsing chart data:", error);
        return [];
    }
}

export function parseLayout(staticLayout?: string, attributeLayout?: string, sampleLayout?: string): Partial<Layout> {
    try {
        const staticObj = staticLayout ? JSON.parse(staticLayout) : {};
        const attrObj = attributeLayout ? JSON.parse(attributeLayout) : {};
        const dynamicObj = Object.keys(attrObj).length > 0 ? attrObj : sampleLayout ? JSON.parse(sampleLayout) : {};

        return deepmerge(staticObj, dynamicObj, mergeOptions);
    } catch (error) {
        console.error("Error parsing chart layout:", error);
        return {};
    }
}

export function parseConfig(configOptions?: string): Partial<Config> {
    if (!configOptions) {
        return {};
    }

    try {
        return JSON.parse(configOptions);
    } catch (error) {
        console.error("Error parsing chart config:", error);
        return {};
    }
}

export function mergeChartProps(chartProps: ChartProps, editorState: EditorStoreState): ChartProps {
    return {
        ...chartProps,
        config: deepmerge(chartProps.config, parseConfig(editorState.config), mergeOptions),
        layout: deepmerge(chartProps.layout, parseLayout(editorState.layout), mergeOptions),
        data: chartProps.data.map((trace, index) => {
            let stateTrace: Data | null = null;
            try {
                if (!editorState.data || !editorState.data[index]) {
                    return trace;
                }
                stateTrace = JSON.parse(editorState.data[index]);
            } catch {
                console.warn(`Editor props for trace(${index}) is not a valid JSON:${editorState.data[index]}`);
                console.warn("Please make sure the props is a valid JSON string.");
            }
            // deepmerge can't handle null, so return trace unchanged if stateTrace is null/undefined
            if (stateTrace == null || typeof stateTrace !== "object") {
                return trace;
            }
            return deepmerge(trace as object, stateTrace as object, mergeOptions) as Data;
        })
    };
}
