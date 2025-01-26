/**
 * This file was generated from Combobox.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, ReactNode } from "react";
import { ActionValue, DynamicValue, EditableValue, ListValue, ListAttributeValue, ListExpressionValue, ListWidgetValue, ReferenceValue, ReferenceSetValue, SelectionSingleValue, SelectionMultiValue } from "mendix";
import { Big } from "big.js";

export type SourceEnum = "context" | "database" | "static";

export type OptionsSourceTypeEnum = "association" | "enumeration" | "boolean";

export type OptionsSourceAssociationCaptionTypeEnum = "attribute" | "expression";

export type OptionsSourceDatabaseCaptionTypeEnum = "attribute" | "expression";

export interface OptionsSourceStaticDataSourceType {
    staticDataSourceValue: DynamicValue<string | Big | boolean | Date>;
    staticDataSourceCustomContent: ReactNode;
    staticDataSourceCaption: DynamicValue<string>;
}

export type OptionsSourceAssociationCustomContentTypeEnum = "yes" | "listItem" | "no";

export type OptionsSourceDatabaseCustomContentTypeEnum = "yes" | "listItem" | "no";

export type StaticDataSourceCustomContentTypeEnum = "yes" | "listItem" | "no";

export type SelectionMethodEnum = "checkbox" | "rowclick";

export type SelectedItemsStyleEnum = "text" | "boxes";

export type ReadOnlyStyleEnum = "bordered" | "text";

export type LoadingTypeEnum = "spinner" | "skeleton";

export type SelectedItemsSortingEnum = "caption" | "none";

export type FilterTypeEnum = "contains" | "containsExact" | "startsWith" | "none";

export interface OptionsSourceStaticDataSourcePreviewType {
    staticDataSourceValue: string;
    staticDataSourceCustomContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    staticDataSourceCaption: string;
}

export interface ComboboxContainerProps {
    name: string;
    tabIndex?: number;
    id: string;
    source: SourceEnum;
    optionsSourceType: OptionsSourceTypeEnum;
    attributeEnumeration: EditableValue<string>;
    attributeBoolean: EditableValue<boolean>;
    optionsSourceDatabaseDataSource?: ListValue;
    optionsSourceDatabaseItemSelection?: SelectionSingleValue | SelectionMultiValue;
    optionsSourceAssociationCaptionType: OptionsSourceAssociationCaptionTypeEnum;
    optionsSourceDatabaseCaptionType: OptionsSourceDatabaseCaptionTypeEnum;
    optionsSourceAssociationCaptionAttribute?: ListAttributeValue<string>;
    optionsSourceDatabaseCaptionAttribute?: ListAttributeValue<string>;
    optionsSourceAssociationCaptionExpression?: ListExpressionValue<string>;
    optionsSourceDatabaseCaptionExpression?: ListExpressionValue<string>;
    optionsSourceDatabaseValueAttribute?: ListAttributeValue<string | Big>;
    databaseAttributeString?: EditableValue<string | Big>;
    attributeAssociation: ReferenceValue | ReferenceSetValue;
    optionsSourceAssociationDataSource?: ListValue;
    staticAttribute: EditableValue<string | Big | boolean | Date>;
    optionsSourceStaticDataSource: OptionsSourceStaticDataSourceType[];
    emptyOptionText?: DynamicValue<string>;
    noOptionsText?: DynamicValue<string>;
    clearable: boolean;
    optionsSourceAssociationCustomContentType: OptionsSourceAssociationCustomContentTypeEnum;
    optionsSourceAssociationCustomContent?: ListWidgetValue;
    optionsSourceDatabaseCustomContentType: OptionsSourceDatabaseCustomContentTypeEnum;
    optionsSourceDatabaseCustomContent?: ListWidgetValue;
    staticDataSourceCustomContentType: StaticDataSourceCustomContentTypeEnum;
    showFooter: boolean;
    menuFooterContent?: ReactNode;
    selectionMethod: SelectionMethodEnum;
    selectedItemsStyle: SelectedItemsStyleEnum;
    selectAllButton: boolean;
    selectAllButtonCaption: DynamicValue<string>;
    readOnlyStyle: ReadOnlyStyleEnum;
    onChangeEvent?: ActionValue;
    onEnterEvent?: ActionValue;
    onLeaveEvent?: ActionValue;
    ariaRequired: boolean;
    clearButtonAriaLabel?: DynamicValue<string>;
    removeValueAriaLabel?: DynamicValue<string>;
    a11ySelectedValue?: DynamicValue<string>;
    a11yOptionsAvailable?: DynamicValue<string>;
    a11yInstructions?: DynamicValue<string>;
    lazyLoading: boolean;
    loadingType: LoadingTypeEnum;
    selectedItemsSorting: SelectedItemsSortingEnum;
    filterType: FilterTypeEnum;
}

export interface ComboboxPreviewProps {
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    source: SourceEnum;
    optionsSourceType: OptionsSourceTypeEnum;
    attributeEnumeration: string;
    attributeBoolean: string;
    optionsSourceDatabaseDataSource: {} | { caption: string } | { type: string } | null;
    optionsSourceDatabaseItemSelection: "Single" | "Multi" | "None";
    optionsSourceAssociationCaptionType: OptionsSourceAssociationCaptionTypeEnum;
    optionsSourceDatabaseCaptionType: OptionsSourceDatabaseCaptionTypeEnum;
    optionsSourceAssociationCaptionAttribute: string;
    optionsSourceDatabaseCaptionAttribute: string;
    optionsSourceAssociationCaptionExpression: string;
    optionsSourceDatabaseCaptionExpression: string;
    optionsSourceDatabaseValueAttribute: string;
    databaseAttributeString: string;
    attributeAssociation: string;
    optionsSourceAssociationDataSource: {} | { caption: string } | { type: string } | null;
    staticAttribute: string;
    optionsSourceStaticDataSource: OptionsSourceStaticDataSourcePreviewType[];
    emptyOptionText: string;
    noOptionsText: string;
    clearable: boolean;
    optionsSourceAssociationCustomContentType: OptionsSourceAssociationCustomContentTypeEnum;
    optionsSourceAssociationCustomContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    optionsSourceDatabaseCustomContentType: OptionsSourceDatabaseCustomContentTypeEnum;
    optionsSourceDatabaseCustomContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    staticDataSourceCustomContentType: StaticDataSourceCustomContentTypeEnum;
    showFooter: boolean;
    menuFooterContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    selectionMethod: SelectionMethodEnum;
    selectedItemsStyle: SelectedItemsStyleEnum;
    selectAllButton: boolean;
    selectAllButtonCaption: string;
    readOnlyStyle: ReadOnlyStyleEnum;
    onChangeEvent: {} | null;
    onChangeDatabaseEvent: {} | null;
    onEnterEvent: {} | null;
    onLeaveEvent: {} | null;
    ariaRequired: boolean;
    clearButtonAriaLabel: string;
    removeValueAriaLabel: string;
    a11ySelectedValue: string;
    a11yOptionsAvailable: string;
    a11yInstructions: string;
    lazyLoading: boolean;
    loadingType: LoadingTypeEnum;
    selectedItemsSorting: SelectedItemsSortingEnum;
    filterType: FilterTypeEnum;
}
