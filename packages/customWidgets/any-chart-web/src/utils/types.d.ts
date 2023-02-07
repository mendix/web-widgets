import { BarMode, ScatterData } from "plotly.js";

export interface WrapperProps {
    "class"?: string;
    style?: string;
}

export interface RuntimeProps {
    mxform: mxui.lib.form._FormBase;
    mxObject?: mendix.lib.MxObject;
    readOnly: boolean;
    friendlyId: string;
}

export interface LayoutProps {
    defaultData?: ScatterData[];
    grid: "none" | "horizontal" | "vertical" | "both";
    showLegend: boolean;
    xAxisLabel: string;
    yAxisLabel: string;
    layoutOptions: string;
    devMode: "basic" | "advanced" | "developer";
}

export interface BarLayoutProps extends LayoutProps {
    barMode: BarMode;
    orientation: "bar" | "column";
}

export interface LineLayoutProps extends LayoutProps {
    fill: boolean;
    area?: "separate" | "stacked";
}

export type LineMode = "lines" | "markers" | "lines+markers" | "none";
