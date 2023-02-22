import { Action, Reducer } from "redux";
import { AnyChartPlayground } from "../components/AnyPlayground";
import { ReactChild } from "react";
import { DefaultReduxStore, registerReducer } from "../../store";

export type AnyChartAction = Action & AnyChartInstanceState & { instanceID: string };

export interface AnyChartData {
    attributeData: string;
    attributeLayout: string;
    dataStatic: string;
    layoutStatic: string;
    configurationOptions: string;
}
export interface AnyChartInstanceState extends AnyChartData {
    playground?: typeof AnyChartPlayground;
    alertMessage?: ReactChild;
    fetchingData: boolean;
}

export interface AnyChartReducerState {
    [ widgetID: string ]: AnyChartInstanceState;
}

export interface AnyReduxStore extends DefaultReduxStore {
    any: AnyChartReducerState;
}

const prefix = "AnyChart";
export const ALERT_MESSAGE = `${prefix}.ALERT_MESSAGE`;
export const FETCHED_DATA = `${prefix}.FETCH_DATA`;
export const TOGGLE_FETCHING_DATA = `${prefix}.TOGGLE_FETCHING_DATA`;
export const NO_CONTEXT = `${prefix}.NO_CONTEXT`;
export const LOAD_PLAYGROUND = `${prefix}.LOAD_PLAYGROUND`;
export const UPDATE_DATA_FROM_PLAYGROUND = `${prefix}.UPDATE_DATA_FROM_PLAYGROUND`;
export const CLEAR_INSTANCE_STATE = `${prefix}.CLEAR_INSTANCE_STATE`;

export const defaultInstanceState: Partial<AnyChartInstanceState> = {
    alertMessage: "",
    fetchingData: false
};

export const anyChartReducer: Reducer<AnyChartReducerState> = (state = {} as AnyChartReducerState, action: AnyChartAction): AnyChartReducerState => {
    switch (action.type) {
        case FETCHED_DATA:
            return {
                ...state,
                [action.instanceID]: {
                    ...defaultInstanceState,
                    ...state[action.instanceID],
                    attributeData: action.attributeData,
                    attributeLayout: action.attributeLayout,
                    dataStatic: action.dataStatic,
                    layoutStatic: action.layoutStatic,
                    configurationOptions: action.configurationOptions,
                    fetchingData: false
                }
            };
        case NO_CONTEXT:
            return {
                ...state,
                [action.instanceID]: {
                    ...defaultInstanceState,
                    ...state[action.instanceID],
                    ...defaultInstanceState
                } };
        case TOGGLE_FETCHING_DATA:
            return {
                ...state,
                [action.instanceID]: {
                    ...defaultInstanceState,
                    ...state[action.instanceID],
                    fetchingData: action.fetchingData
                } };
        case LOAD_PLAYGROUND:
            return {
                ...state,
                [action.instanceID]: {
                    ...defaultInstanceState,
                    ...state[action.instanceID],
                    playground: action.playground
                } };
        case UPDATE_DATA_FROM_PLAYGROUND:
            return {
                ...state,
                [action.instanceID]: {
                    ...defaultInstanceState,
                    ...state[action.instanceID],
                    attributeData: action.attributeData,
                    attributeLayout: action.attributeLayout,
                    dataStatic: action.dataStatic,
                    layoutStatic: action.layoutStatic,
                    configurationOptions: action.configurationOptions
                }
            };
        case ALERT_MESSAGE:
            return {
                ...state,
                [action.instanceID]: {
                    ...defaultInstanceState,
                    ...state[action.instanceID],
                    alertMessage: action.alertMessage
                } };
        case CLEAR_INSTANCE_STATE:
            const newState = { ...state };
            delete newState[action.instanceID];

            return newState;
        default:
            return state;
    }
};

registerReducer({ any: anyChartReducer });
