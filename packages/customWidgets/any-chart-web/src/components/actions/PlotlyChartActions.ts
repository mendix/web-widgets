import {
    CLEAR_INSTANCE_STATE,
    ChartData,
    Plotly,
    RESET,
    TOGGLE_PLOTLY_API_LOADING,
    TOGGLE_PLOTLY_DATA_LOADING,
    UPDATE_DATA
} from "../reducers/PlotlyChartReducer";

export const resetState = () => ({  type: RESET });
export const togglePlotlyAPILoading = (widgetID: string, loadingAPI: boolean, plotly?: Plotly) =>
    ({ type: TOGGLE_PLOTLY_API_LOADING, widgetID, loadingAPI, plotly });
export const togglePlotlyDataLoading = (widgetID: string, loadingData: boolean) =>
    ({ type: TOGGLE_PLOTLY_DATA_LOADING, widgetID, loadingData });
export const updateData = (widgetID: string, data: ChartData) => ({ type: UPDATE_DATA, widgetID, ...data });

export const clearInstanceState = (instanceID: string) =>
    ({ type: CLEAR_INSTANCE_STATE, instanceID });
