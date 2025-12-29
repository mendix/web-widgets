import { EditorStoreState } from "@mendix/shared-charts/main";
import deepmerge from "deepmerge";
import { Config, Data, Layout } from "plotly.js-dist-min";
import { ChartProps } from "../components/PlotlyChart";

// Plotly-specific deep merge: arrays are replaced (not concatenated) to match Plotly expectations
const deepmergePlotly = <T extends object>(target: T, source: T): T =>
    deepmerge(target, source, { arrayMerge: (_target, src) => src });

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
            result.push(deepmergePlotly(staticTrace, dynamicTrace));
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

        return deepmergePlotly(staticObj, dynamicObj);
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
        config: deepmergePlotly(chartProps.config, parseConfig(editorState.config)),
        layout: deepmergePlotly(chartProps.layout, parseLayout(editorState.layout)),
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
            return deepmergePlotly(trace, stateTrace);
        })
    };
}
