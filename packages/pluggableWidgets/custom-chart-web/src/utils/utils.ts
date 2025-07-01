import { Config, Data, Layout } from "plotly.js-dist-min";
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
