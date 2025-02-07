/**
 * This file was generated from Datagrid.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { ActionValue, DynamicValue, EditableValue, ListValue, ListActionValue, ListAttributeValue, ListAttributeListValue, ListExpressionValue, ListReferenceValue, ListReferenceSetValue, ListWidgetValue, SelectionSingleValue, SelectionMultiValue } from "mendix";
import { Big } from "big.js";

export type ItemSelectionMethodEnum = "checkbox" | "rowClick";

export type ItemSelectionModeEnum = "toggle" | "clear";

export type LoadingTypeEnum = "spinner" | "skeleton";

export type ShowContentAsEnum = "attribute" | "dynamicText" | "customContent";

export type FilterCaptionTypeEnum = "attribute" | "expression";

export type HidableEnum = "yes" | "hidden" | "no";

export type WidthEnum = "autoFill" | "autoFit" | "manual";

export type MinWidthEnum = "auto" | "minContent" | "manual";

export type AlignmentEnum = "left" | "center" | "right";

export interface ColumnsType {
    showContentAs: ShowContentAsEnum;
    attribute?: ListAttributeValue<string | Big | boolean | Date> | ListAttributeListValue<string | Big | boolean | Date>;
    content?: ListWidgetValue;
    dynamicText?: ListExpressionValue<string>;
    exportValue?: ListExpressionValue<string>;
    header?: DynamicValue<string>;
    tooltip?: ListExpressionValue<string>;
    filter?: ReactNode;
    visible: DynamicValue<boolean>;
    filterAssociation?: ListReferenceValue | ListReferenceSetValue;
    filterAssociationOptions?: ListValue;
    fetchOptionsLazy: boolean;
    filterCaptionType: FilterCaptionTypeEnum;
    filterAssociationOptionLabel?: ListExpressionValue<string>;
    filterAssociationOptionLabelAttr?: ListAttributeValue<string>;
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

export type PaginationEnum = "buttons" | "virtualScrolling" | "loadMore";

export type ShowPagingButtonsEnum = "always" | "auto";

export type PagingPositionEnum = "bottom" | "top" | "both";

export type ShowEmptyPlaceholderEnum = "none" | "custom";

export type OnClickTriggerEnum = "single" | "double";

export type ConfigurationStorageTypeEnum = "attribute" | "localStorage";

export interface FilterListType {
    filter: ListAttributeValue<string | Big | boolean | Date>;
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
    visible: string;
    filterAssociation: string;
    filterAssociationOptions: {} | { caption: string } | { type: string } | null;
    fetchOptionsLazy: boolean;
    filterCaptionType: FilterCaptionTypeEnum;
    filterAssociationOptionLabel: string;
    filterAssociationOptionLabelAttr: string;
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

export interface FilterListPreviewType {
    filter: string;
}

export interface DatagridContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    advanced: boolean;
    datasource: ListValue;
    refreshInterval: number;
    itemSelection?: SelectionSingleValue | SelectionMultiValue;
    itemSelectionMethod: ItemSelectionMethodEnum;
    itemSelectionMode: ItemSelectionModeEnum;
    showSelectAllToggle: boolean;
    loadingType: LoadingTypeEnum;
    columns: ColumnsType[];
    columnsFilterable: boolean;
    pageSize: number;
    pagination: PaginationEnum;
    showPagingButtons: ShowPagingButtonsEnum;
    showNumberOfRows: boolean;
    pagingPosition: PagingPositionEnum;
    loadMoreButtonCaption?: DynamicValue<string>;
    showEmptyPlaceholder: ShowEmptyPlaceholderEnum;
    emptyPlaceholder?: ReactNode;
    rowClass?: ListExpressionValue<string>;
    onClickTrigger: OnClickTriggerEnum;
    onClick?: ListActionValue;
    onSelectionChange?: ActionValue;
    columnsSortable: boolean;
    columnsResizable: boolean;
    columnsDraggable: boolean;
    columnsHidable: boolean;
    configurationStorageType: ConfigurationStorageTypeEnum;
    configurationAttribute?: EditableValue<string>;
    storeFiltersInPersonalization: boolean;
    filterList: FilterListType[];
    filtersPlaceholder?: ReactNode;
    filterSectionTitle?: DynamicValue<string>;
    exportDialogLabel?: DynamicValue<string>;
    cancelExportLabel?: DynamicValue<string>;
    selectRowLabel?: DynamicValue<string>;
}

export interface DatagridPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    advanced: boolean;
    datasource: {} | { caption: string } | { type: string } | null;
    refreshInterval: number | null;
    itemSelection: "None" | "Single" | "Multi";
    itemSelectionMethod: ItemSelectionMethodEnum;
    itemSelectionMode: ItemSelectionModeEnum;
    showSelectAllToggle: boolean;
    loadingType: LoadingTypeEnum;
    columns: ColumnsPreviewType[];
    columnsFilterable: boolean;
    pageSize: number | null;
    pagination: PaginationEnum;
    showPagingButtons: ShowPagingButtonsEnum;
    showNumberOfRows: boolean;
    pagingPosition: PagingPositionEnum;
    loadMoreButtonCaption: string;
    showEmptyPlaceholder: ShowEmptyPlaceholderEnum;
    emptyPlaceholder: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    rowClass: string;
    onClickTrigger: OnClickTriggerEnum;
    onClick: {} | null;
    onSelectionChange: {} | null;
    columnsSortable: boolean;
    columnsResizable: boolean;
    columnsDraggable: boolean;
    columnsHidable: boolean;
    configurationStorageType: ConfigurationStorageTypeEnum;
    configurationAttribute: string;
    storeFiltersInPersonalization: boolean;
    onConfigurationChange: {} | null;
    filterList: FilterListPreviewType[];
    filtersPlaceholder: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    filterSectionTitle: string;
    exportDialogLabel: string;
    cancelExportLabel: string;
    selectRowLabel: string;
}
