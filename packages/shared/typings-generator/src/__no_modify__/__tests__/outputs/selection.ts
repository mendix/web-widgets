export const selectionWebOutput = `/**
 * This file was generated from MyWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ListValue, SelectionSingleValue, SelectionMultiValue } from "mendix";

export interface MyWidgetContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    selectionAll?: SelectionSingleValue | SelectionMultiValue;
    selectionSingleMulti: SelectionSingleValue | SelectionMultiValue;
    selectionMulti: SelectionMultiValue;
    optionalSelectionAll?: SelectionSingleValue | SelectionMultiValue;
    optionalSelectionSingleMulti?: SelectionSingleValue | SelectionMultiValue;
    optionalSelectionMulti?: SelectionMultiValue;
    optionalDataSource?: ListValue;
    requiredDataSource: ListValue;
}

export interface MyWidgetPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    selectionAll: "None" | "Single" | "Multi";
    selectionSingleMulti: "Single" | "Multi";
    selectionMulti: "Multi";
    optionalSelectionAll: "None" | "Single" | "Multi";
    optionalSelectionSingleMulti: "Single" | "Multi" | "None";
    optionalSelectionMulti: "Multi" | "None";
    optionalDataSource: {} | { type: string } | null;
    requiredDataSource: {} | { type: string } | null;
}
`;

export const selectionNativeOutput = `export interface MyWidgetProps<Style> {
    name: string;
    style: Style[];
    selectionAll?: SelectionSingleValue | SelectionMultiValue;
    selectionSingleMulti: SelectionSingleValue | SelectionMultiValue;
    selectionMulti: SelectionMultiValue;
    optionalSelectionAll?: SelectionSingleValue | SelectionMultiValue;
    optionalSelectionSingleMulti?: SelectionSingleValue | SelectionMultiValue;
    optionalSelectionMulti?: SelectionMultiValue;
    optionalDataSource?: ListValue;
    requiredDataSource: ListValue;
}`;
