/**
 * This file was generated from Gallery.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { ActionValue, DynamicValue, ListValue, ListActionValue, ListExpressionValue, ListWidgetValue, SelectionSingleValue, SelectionMultiValue } from "mendix";

export type ItemSelectionModeEnum = "toggle" | "clear";

export type PaginationEnum = "buttons" | "virtualScrolling";

export type PagingPositionEnum = "below" | "above";

export type ShowPagingButtonsEnum = "always" | "auto";

export type ShowEmptyPlaceholderEnum = "none" | "custom";

export type OnClickTriggerEnum = "single" | "double";

export interface GalleryContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    filtersPlaceholder?: ReactNode;
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
    showPagingButtons: ShowPagingButtonsEnum;
    showTotalCount: boolean;
    showEmptyPlaceholder: ShowEmptyPlaceholderEnum;
    emptyPlaceholder?: ReactNode;
    itemClass?: ListExpressionValue<string>;
    onClickTrigger: OnClickTriggerEnum;
    onClick?: ListActionValue;
    onSelectionChange?: ActionValue;
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
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    filtersPlaceholder: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
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
    showPagingButtons: ShowPagingButtonsEnum;
    showTotalCount: boolean;
    showEmptyPlaceholder: ShowEmptyPlaceholderEnum;
    emptyPlaceholder: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    itemClass: string;
    onClickTrigger: OnClickTriggerEnum;
    onClick: {} | null;
    onSelectionChange: {} | null;
    filterSectionTitle: string;
    emptyMessageTitle: string;
    ariaLabelListBox: string;
}
