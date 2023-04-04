import { CLEAR_INSTANCE_STATE, Plotly, TOGGLE_PLOTLY_API_LOADING } from "../reducers/PlotlyChartReducer";

export const togglePlotlyAPILoading = (widgetID: string, loadingAPI: boolean, plotly?: Plotly) => ({
    type: TOGGLE_PLOTLY_API_LOADING,
    widgetID,
    loadingAPI,
    plotly
});

export const clearInstanceState = (instanceID: string) => ({ type: CLEAR_INSTANCE_STATE, instanceID });
