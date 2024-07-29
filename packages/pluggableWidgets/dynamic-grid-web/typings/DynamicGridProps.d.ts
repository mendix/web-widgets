/**
 * This file was generated from DynamicGrid.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { DynamicValue, ListValue, ListAttributeValue, ListExpressionValue, ListReferenceValue, ListReferenceSetValue, ListWidgetValue } from "mendix";
import { Big } from "big.js";

export type ShowContentAsEnum = "attribute" | "dynamicText" | "customContent";

export type HidableEnum = "yes" | "hidden" | "no";

export type WidthEnum = "autoFill" | "autoFit" | "manual";

export type MinWidthEnum = "auto" | "minContent" | "manual";

export type AlignmentEnum = "left" | "center" | "right";

export interface ColumnsType {
    showContentAs: ShowContentAsEnum;
    attribute?: ListAttributeValue<string | Big | boolean | Date>;
    content?: ListWidgetValue;
    dynamicText?: ListExpressionValue<string>;
    exportValue?: ListExpressionValue<string>;
    header?: DynamicValue<string>;
    tooltip?: ListExpressionValue<string>;
    filter?: ReactNode;
    filterAssociation?: ListReferenceValue | ListReferenceSetValue;
    filterAssociationOptions?: ListValue;
    filterAssociationOptionLabel?: ListExpressionValue<string>;
    visible: DynamicValue<boolean>;
    sortable: boolean;
    resizable: boolean;
    draggable: boolean;
    hidable: HidableEnum;
    allowEventPropagation: boolean;
    width: WidthEnum;
    minWidth: MinWidthEnum;
    minWidthLimit: number;
    size: number;
    alignment: AlignmentEnum;
    columnClass?: ListExpressionValue<string>;
    wrapText: boolean;
}

export interface ColumnsPreviewType {
    showContentAs: ShowContentAsEnum;
    attribute: string;
    content: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    dynamicText: string;
    exportValue: string;
    header: string;
    tooltip: string;
    filter: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    filterAssociation: string;
    filterAssociationOptions: {} | { caption: string } | { type: string } | null;
    filterAssociationOptionLabel: string;
    visible: string;
    sortable: boolean;
    resizable: boolean;
    draggable: boolean;
    hidable: HidableEnum;
    allowEventPropagation: boolean;
    width: WidthEnum;
    minWidth: MinWidthEnum;
    minWidthLimit: number | null;
    size: number | null;
    alignment: AlignmentEnum;
    columnClass: string;
    wrapText: boolean;
}

export interface DynamicGridContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    datasource: ListValue;
    columns: ColumnsType[];
    columnsFilterable: boolean;
}

export interface DynamicGridPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    datasource: {} | { caption: string } | { type: string } | null;
    columns: ColumnsPreviewType[];
    columnsFilterable: boolean;
}
