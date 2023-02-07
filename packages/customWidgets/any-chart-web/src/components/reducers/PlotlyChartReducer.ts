import { Config, Data, HeatMapData, Layout, PieData, PlotlyHTMLElement, Root, ScatterData } from "plotly.js";
import { Action, Reducer } from "redux";

export type PlotlyChartAction = Action & PlotlyChartInstance & { widgetID: string };

export interface ChartData {
    layout?: Partial<Layout>;
    data?: ScatterData[] | PieData[] | HeatMapData[];
    config?: Partial<Config>;
}
export interface PlotlyChartInstance extends ChartData {
    loadingAPI: boolean;
    loadingData: boolean;
    refresh: boolean;
    plotly?: Plotly;
}

export interface PlotlyChartState {
    [ widgetID: string ]: PlotlyChartInstance;
}

export interface Plotly {
    newPlot: (root: Root, data: Data[], layout?: Partial<Layout>, config?: Partial<Config>) => Promise<PlotlyHTMLElement>;
    purge: (root: Root) => void;
    relayout?: (root: Root, layout: Partial<Layout>) => Promise<PlotlyHTMLElement>;
}

const prefix = "PlotlyChart";
export const RESET = `${prefix}.RESET`;
export const TOGGLE_PLOTLY_API_LOADING = `${prefix}.TOGGLE_PLOTLY_API_LOADING`;
export const TOGGLE_PLOTLY_DATA_LOADING = `${prefix}.TOGGLE_PLOTLY_DATA_LOADING`;
export const UPDATE_DATA = `${prefix}.UPDATE_DATA`;
export const CLEAR_INSTANCE_STATE = `${prefix}.CLEAR_INSTANCE_STATE`;

export const defaultPlotlyInstanceState: Partial<PlotlyChartInstance> = {
    loadingAPI: true,
    data: [],
    layout: {},
    config: {}
};
const defaultState: Partial<PlotlyChartState> = {};

export const plotlyChartReducer: Reducer<PlotlyChartState> = (state = defaultState as PlotlyChartState, action: PlotlyChartAction): PlotlyChartState => {
    switch (action.type) {
        case TOGGLE_PLOTLY_API_LOADING:
            return {
                ...state,
                [action.widgetID]: {
                    ...defaultPlotlyInstanceState,
                    ...state[action.widgetID],
                    loadingAPI: action.loadingAPI,
                    plotly: action.plotly
                }
            };
        case TOGGLE_PLOTLY_DATA_LOADING:
            return {
                ...state,
                [action.widgetID]: {
                    ...defaultPlotlyInstanceState,
                    ...state[action.widgetID],
                    loadingData: action.loadingData
                }
            };
        case UPDATE_DATA:
            return {
                ...state,
                [action.widgetID]: {
                    ...defaultPlotlyInstanceState,
                    ...state[action.widgetID],
                    plotly: state[action.widgetID] && state[action.widgetID].plotly,
                    loadingData: false,
                    data: action.data && action.data.slice(),
                    layout: action.layout,
                    config: action.config
                }
            };
        case RESET:
            return defaultState as PlotlyChartState;
        case CLEAR_INSTANCE_STATE:
            const newState: PlotlyChartState = { ...state };
            delete newState[action.widgetID];

            return newState;
        default:
            return state;
    }
};
