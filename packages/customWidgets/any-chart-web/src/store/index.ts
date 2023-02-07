import { Reducer, Store, applyMiddleware, combineReducers, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
// import { createLogger } from "redux-logger";

import { PlotlyChartState, plotlyChartReducer } from "../components/reducers/PlotlyChartReducer";

export let store: Store<any>;
let reducers: { [key: string ]: Reducer<any> } = { plotly: plotlyChartReducer };
// NB: activate redux-logger if you need to examine the state data in the console, or you aren't testing on Chrome
// const loggerMiddleware = createLogger();
export const registerReducer = (reducer?: { [key: string ]: Reducer<any>}) => {
    reducers = reducer ? { ...reducers, ...reducer } : reducers;
    store = createStore(
        combineReducers(reducers),
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
        applyMiddleware(thunkMiddleware/*, loggerMiddleware*/)
    );
};
registerReducer();
export interface DefaultReduxStore {
    plotly: PlotlyChartState;
}
