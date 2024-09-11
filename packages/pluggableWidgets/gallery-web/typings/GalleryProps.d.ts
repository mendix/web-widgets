/**
 * This file was generated from Gallery.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { ActionValue, DynamicValue, ListValue, ListActionValue, ListAttributeValue, ListExpressionValue, ListReferenceValue, ListReferenceSetValue, ListWidgetValue, SelectionSingleValue, SelectionMultiValue } from "mendix";
import { Big } from "big.js";

export type ItemSelectionModeEnum = "toggle" | "clear";

export type PaginationEnum = "buttons" | "virtualScrolling";

export type PagingPositionEnum = "below" | "above";

export type ShowEmptyPlaceholderEnum = "none" | "custom";

export type OnClickTriggerEnum = "single" | "double";

export type TypeEnum = "attrs" | "reference";

export interface GroupListType {
    type: TypeEnum;
    key: string;
    ref?: ListReferenceValue | ListReferenceSetValue;
    refOptions?: ListValue;
    caption?: ListExpressionValue<string>;
}

export interface GroupAttrsType {
    key: string;
    attr: ListAttributeValue<string | Big | boolean | Date>;
}

export interface FilterListType {
    filter: ListAttributeValue<string | Big | boolean | Date>;
}

export interface SortListType {
    attribute: ListAttributeValue<string | Big | boolean | Date>;
    caption: DynamicValue<string>;
}

export interface GroupListPreviewType {
    type: TypeEnum;
    key: string;
    ref: string;
    refOptions: {} | { caption: string } | { type: string } | null;
    caption: string;
}

export interface GroupAttrsPreviewType {
    key: string;
    attr: string;
}

export interface FilterListPreviewType {
    filter: string;
}

export interface SortListPreviewType {
    attribute: string;
    caption: string;
}

export interface GalleryContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    advanced: boolean;
    datasource: ListValue;
    itemSelection?: SelectionSingleValue | SelectionMultiValue;
    itemSelectionMode: ItemSelectionModeEnum;
    content?: ListWidgetValue;
    desktopItems: number;
    tabletItems: number;
    phoneItems: number;
    pageSize: number;
    pagination: PaginationEnum;
    pagingPosition: PagingPositionEnum;
    showEmptyPlaceholder: ShowEmptyPlaceholderEnum;
    emptyPlaceholder?: ReactNode;
    itemClass?: ListExpressionValue<string>;
    onClickTrigger: OnClickTriggerEnum;
    onClick?: ListActionValue;
    onSelectionChange?: ActionValue;
    enableFilterGroups: boolean;
    groupList: GroupListType[];
    groupAttrs: GroupAttrsType[];
    filterList: FilterListType[];
    filtersPlaceholder?: ReactNode;
    sortList: SortListType[];
    filterSectionTitle?: DynamicValue<string>;
    emptyMessageTitle?: DynamicValue<string>;
    ariaLabelListBox?: DynamicValue<string>;
}

export interface GalleryPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    advanced: boolean;
    datasource: {} | { caption: string } | { type: string } | null;
    itemSelection: "None" | "Single" | "Multi";
    itemSelectionMode: ItemSelectionModeEnum;
    content: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    desktopItems: number | null;
    tabletItems: number | null;
    phoneItems: number | null;
    pageSize: number | null;
    pagination: PaginationEnum;
    pagingPosition: PagingPositionEnum;
    showEmptyPlaceholder: ShowEmptyPlaceholderEnum;
    emptyPlaceholder: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    itemClass: string;
    onClickTrigger: OnClickTriggerEnum;
    onClick: {} | null;
    onSelectionChange: {} | null;
    enableFilterGroups: boolean;
    groupList: GroupListPreviewType[];
    groupAttrs: GroupAttrsPreviewType[];
    filterList: FilterListPreviewType[];
    filtersPlaceholder: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    sortList: SortListPreviewType[];
    filterSectionTitle: string;
    emptyMessageTitle: string;
    ariaLabelListBox: string;
}
