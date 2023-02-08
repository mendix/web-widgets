import * as deepMerge from "deepmerge";
import { arrayMerge } from "../../utils/data";
import { AnyChartProps } from "../components/AnyChart";
import { Config, Layout } from "plotly.js";

export const defaultConfigOptions: Partial<Config> = {
    displayModeBar: false,
    doubleClick: "reset"
};
export const getConfigOptions = (props: AnyChartProps): Partial<Config> => {
    const parsedConfig: Partial<Config> = JSON.parse(props.configurationOptions || "{}");

    return deepMerge.all<Partial<Config>>([defaultConfigOptions, parsedConfig]);
};

export const getLayoutOptions = (props: AnyChartProps): Partial<Layout> => {
    const staticLayout: Partial<Layout> = JSON.parse(props.layoutStatic || "{}");
    const attributeLayout: Partial<Layout> = props.attributeLayout ? JSON.parse(props.attributeLayout || "{}") : {};

    return deepMerge.all([{ hovermode: "closest" }, staticLayout, attributeLayout], { arrayMerge });
};

export const getData = (props: AnyChartProps): any[] => {
    const staticData: any[] = JSON.parse(props.dataStatic || "[]");
    const attributeData: any[] = props.attributeData ? JSON.parse(props.attributeData || "{}") : {};

    // Skip for code migration
    // @ts-ignore
    return deepMerge.all([staticData, attributeData], { arrayMerge });
};
