import { Config, Data, Layout } from "plotly.js-dist-min";

export function parseData(staticData?: string, attributeData?: string, sampleData?: string): Data[] {
    let finalData: Data[] = [];

    try {
        if (staticData) {
            finalData = [...finalData, ...JSON.parse(staticData)];
        }
        if (attributeData) {
            finalData = [...finalData, ...JSON.parse(attributeData)];
        }
        if (!finalData.length && sampleData) {
            finalData = [...finalData, ...JSON.parse(sampleData)];
        }
    } catch (error) {
        console.error("Error parsing chart data:", error);
    }

    return finalData;
}

export function parseLayout(staticLayout?: string, attributeLayout?: string, sampleLayout?: string): Partial<Layout> {
    let finalLayout: Partial<Layout> = {};

    try {
        if (staticLayout) {
            finalLayout = { ...finalLayout, ...JSON.parse(staticLayout) };
        }
        if (attributeLayout) {
            finalLayout = { ...finalLayout, ...JSON.parse(attributeLayout) };
        }
        if (Object.keys(finalLayout).length === 0 && sampleLayout) {
            finalLayout = { ...finalLayout, ...JSON.parse(sampleLayout) };
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
