import {
    ALERT_MESSAGE,
    AnyChartAction,
    AnyChartData,
    CLEAR_INSTANCE_STATE,
    FETCHED_DATA,
    NO_CONTEXT,
    TOGGLE_FETCHING_DATA,
    UPDATE_DATA_FROM_PLAYGROUND } from "./AnyChartReducer";
import { ReactChild } from "react";
import { AnyChartDataHandlerProps } from "../components/AnyChartDataHandler";
import { renderError, validateAdvancedOptions } from "../../utils/data";

export const showAlertMessage = (instanceID: string, alertMessage: ReactChild): Partial<AnyChartAction> =>
    ({ type: ALERT_MESSAGE, instanceID, alertMessage });
export const toggleFetchingData = (instanceID: string, fetchingData: boolean): Partial<AnyChartAction> =>
    ({ type: TOGGLE_FETCHING_DATA, instanceID, fetchingData });
export const noContext = (instanceID: string): Partial<AnyChartAction> => ({ type: NO_CONTEXT, instanceID });
export const fetchData = (props: AnyChartDataHandlerProps) => {
    const { dataAttribute, layoutAttribute, friendlyId, instanceID, sampleData, sampleLayout } = props;
    const attributeData = props.mxObject && dataAttribute
        ? props.mxObject.get(dataAttribute) as string
        : sampleData || "[]";
    const attributeLayout = props.mxObject && layoutAttribute
        ? props.mxObject.get(layoutAttribute) as string
        : sampleLayout || "{}";
    const errorMessages: string[] = [];
    [ attributeData, attributeLayout ].forEach((data, index) => {
        const error = validateAdvancedOptions(data);
        const source = index ? "Layout" : "Data";
        if (error) {
            errorMessages.push(`${source} Source attribute value contains invalid JSON: \n${error}`);
        }
    });
    if (errorMessages.length) {
        return showAlertMessage(instanceID, renderError(friendlyId, errorMessages));
    }

    return {
        fetchingData: false,
        attributeData,
        attributeLayout,
        dataStatic: props.dataStatic,
        layoutStatic: props.layoutStatic,
        configurationOptions: props.configurationOptions,
        type: FETCHED_DATA,
        instanceID
    };
};

export const updateDataFromPlayground = (instanceID: string, data: AnyChartData) =>
    ({ type: UPDATE_DATA_FROM_PLAYGROUND, instanceID, ...data });

export const clearInstanceState = (instanceID: string) =>
    ({ type: CLEAR_INSTANCE_STATE, instanceID });
