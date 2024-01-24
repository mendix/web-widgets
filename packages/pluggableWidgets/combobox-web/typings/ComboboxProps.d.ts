/**
 * This file was generated from Combobox.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, ReactNode } from "react";
import { ActionValue, DynamicValue, EditableValue, ListValue, ListAttributeValue, ListExpressionValue, ListWidgetValue, ReferenceValue, ReferenceSetValue } from "mendix";
import { Big } from "big.js";

export type SourceEnum = "context" | "database" | "custom";

export type OptionsSourceTypeEnum = "association" | "enumeration" | "boolean";

export type OptionsSourceDatabaseCaptionTypeEnum = "attribute" | "expression";

export type OptionsSourceAssociationCaptionTypeEnum = "attribute" | "expression";

export type FilterTypeEnum = "contains" | "startsWith" | "none";

export type OptionsSourceAssociationCustomContentTypeEnum = "yes" | "listItem" | "no";

export type OptionsSourceDatabaseCustomContentTypeEnum = "yes" | "listItem" | "no";

export type SelectionMethodEnum = "checkbox" | "rowclick";

export type SelectedItemsStyleEnum = "text" | "boxes";

export interface ComboboxContainerProps {
    name: string;
    tabIndex?: number;
    id: string;
    source: SourceEnum;
    optionsSourceType: OptionsSourceTypeEnum;
    attributeEnumeration: EditableValue<string>;
    attributeBoolean: EditableValue<boolean>;
    attributeString: EditableValue<string | Big>;
    optionsSourceDatabaseDataSource?: ListValue;
    optionsSourceDatabaseValueExpression?: ListExpressionValue<string | Big>;
    optionsSourceDatabaseCaptionType: OptionsSourceDatabaseCaptionTypeEnum;
    attributeAssociation: ReferenceValue | ReferenceSetValue;
    optionsSourceAssociationDataSource?: ListValue;
    optionsSourceAssociationCaptionType: OptionsSourceAssociationCaptionTypeEnum;
    optionsSourceAssociationCaptionAttribute?: ListAttributeValue<string>;
    optionsSourceAssociationCaptionExpression?: ListExpressionValue<string>;
    optionsSourceDatabaseCaptionAttribute?: ListAttributeValue<string>;
    optionsSourceDatabaseCaptionExpression?: ListExpressionValue<string>;
    emptyOptionText?: DynamicValue<string>;
    filterType: FilterTypeEnum;
    noOptionsText?: DynamicValue<string>;
    clearable: boolean;
    optionsSourceAssociationCustomContentType: OptionsSourceAssociationCustomContentTypeEnum;
    optionsSourceAssociationCustomContent?: ListWidgetValue;
    optionsSourceDatabaseCustomContentType: OptionsSourceDatabaseCustomContentTypeEnum;
    optionsSourceDatabaseCustomContent?: ListWidgetValue;
    showFooter: boolean;
    menuFooterContent?: ReactNode;
    selectionMethod: SelectionMethodEnum;
    selectedItemsStyle: SelectedItemsStyleEnum;
    selectAllButton: boolean;
    selectAllButtonCaption: DynamicValue<string>;
    onChangeEvent?: ActionValue;
    onEnterEvent?: ActionValue;
    onLeaveEvent?: ActionValue;
    ariaRequired: boolean;
    clearButtonAriaLabel: DynamicValue<string>;
    removeValueAriaLabel: DynamicValue<string>;
    a11ySelectedValue: DynamicValue<string>;
    a11yOptionsAvailable: DynamicValue<string>;
    a11yInstructions: DynamicValue<string>;
}

export interface ComboboxPreviewProps {
    readOnly: boolean;
    source: SourceEnum;
    optionsSourceType: OptionsSourceTypeEnum;
    attributeEnumeration: string;
    attributeBoolean: string;
    attributeString: string;
    optionsSourceDatabaseDataSource: {} | { caption: string } | { type: string } | null;
    optionsSourceDatabaseValueExpression: string;
    optionsSourceDatabaseCaptionType: OptionsSourceDatabaseCaptionTypeEnum;
    attributeAssociation: string;
    optionsSourceAssociationDataSource: {} | { caption: string } | { type: string } | null;
    optionsSourceAssociationCaptionType: OptionsSourceAssociationCaptionTypeEnum;
    optionsSourceAssociationCaptionAttribute: string;
    optionsSourceAssociationCaptionExpression: string;
    optionsSourceDatabaseCaptionAttribute: string;
    optionsSourceDatabaseCaptionExpression: string;
    emptyOptionText: string;
    filterType: FilterTypeEnum;
    noOptionsText: string;
    clearable: boolean;
    optionsSourceAssociationCustomContentType: OptionsSourceAssociationCustomContentTypeEnum;
    optionsSourceAssociationCustomContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    optionsSourceDatabaseCustomContentType: OptionsSourceDatabaseCustomContentTypeEnum;
    optionsSourceDatabaseCustomContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    showFooter: boolean;
    menuFooterContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    selectionMethod: SelectionMethodEnum;
    selectedItemsStyle: SelectedItemsStyleEnum;
    selectAllButton: boolean;
    selectAllButtonCaption: string;
    onChangeEvent: {} | null;
    onEnterEvent: {} | null;
    onLeaveEvent: {} | null;
    ariaRequired: boolean;
    clearButtonAriaLabel: string;
    removeValueAriaLabel: string;
    a11ySelectedValue: string;
    a11yOptionsAvailable: string;
    a11yInstructions: string;
}
