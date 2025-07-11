import { EditorStoreState } from "@mendix/shared-charts/main";
import { Config, Data, Layout } from "plotly.js-dist-min";
import { ChartProps } from "../components/PlotlyChart";

export function parseData(staticData?: string, attributeData?: string, sampleData?: string): Data[] {
    let finalData: Data[] = [];

    try {
        const dataAttribute = attributeData ? JSON.parse(attributeData) : [];
        finalData = [...finalData, ...(staticData ? JSON.parse(staticData) : []), ...dataAttribute];

        if (dataAttribute.length === 0) {
            finalData = [...finalData, ...(sampleData ? JSON.parse(sampleData) : [])];
        }
    } catch (error) {
        console.error("Error parsing chart data:", error);
    }

    return finalData;
}

export function parseLayout(staticLayout?: string, attributeLayout?: string, sampleLayout?: string): Partial<Layout> {
    let finalLayout: Partial<Layout> = {};

    try {
        const layoutAttribute = attributeLayout ? JSON.parse(attributeLayout) : {};
        finalLayout = { ...finalLayout, ...(staticLayout ? JSON.parse(staticLayout) : {}), ...layoutAttribute };

        if (Object.keys(layoutAttribute).length === 0) {
            finalLayout = { ...finalLayout, ...(sampleLayout ? JSON.parse(sampleLayout) : {}) };
        }
    } catch (error) {
        console.error("Error parsing chart layout:", error);
    }
    return finalLayout;
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
        config: {
            ...chartProps.config,
            ...parseConfig(editorState.config)
        },
        layout: {
            ...chartProps.layout,
            ...parseLayout(editorState.layout)
        },
        data: chartProps.data.map((trace, index) => {
            let stateTrace: Data = {};
            try {
                if (!editorState.data || !editorState.data[index]) {
                    return trace;
                }
                stateTrace = JSON.parse(editorState.data[index]);
            } catch {
                console.warn(`Editor props for trace(${index}) is not a valid JSON:${editorState.data[index]}`);
                console.warn("Please make sure the props is a valid JSON string.");
            }
            return {
                ...trace,
                ...stateTrace
            } as Data;
        })
    };
}
