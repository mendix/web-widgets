/**
 * This file was generated from CheckboxRadioSelection.xml
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

export type OptionsSourceCustomContentTypeEnum = "yes" | "no";

export type ControlTypeEnum = "checkbox" | "radio";

export type CustomEditabilityEnum = "default" | "never" | "conditionally";

export type ReadOnlyStyleEnum = "bordered" | "text";

export interface OptionsSourceStaticDataSourcePreviewType {
    staticDataSourceValue: string;
    staticDataSourceCustomContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    staticDataSourceCaption: string;
}

export interface CheckboxRadioSelectionContainerProps {
    name: string;
    tabIndex?: number;
    id: string;
    source: SourceEnum;
    optionsSourceType: OptionsSourceTypeEnum;
    attributeEnumeration: EditableValue<string>;
    attributeBoolean: EditableValue<boolean>;
    optionsSourceDatabaseDataSource?: ListValue;
    optionsSourceDatabaseItemSelection?: SelectionSingleValue | SelectionMultiValue;
    optionsSourceDatabaseValueAttribute?: ListAttributeValue<string | Big>;
    databaseAttributeString?: EditableValue<string | Big>;
    attributeAssociation: ReferenceValue | ReferenceSetValue;
    optionsSourceAssociationDataSource?: ListValue;
    optionsSourceAssociationCaptionType: OptionsSourceAssociationCaptionTypeEnum;
    optionsSourceDatabaseCaptionType: OptionsSourceDatabaseCaptionTypeEnum;
    optionsSourceAssociationCaptionAttribute?: ListAttributeValue<string>;
    optionsSourceDatabaseCaptionAttribute?: ListAttributeValue<string>;
    optionsSourceAssociationCaptionExpression?: ListExpressionValue<string>;
    optionsSourceDatabaseCaptionExpression?: ListExpressionValue<string>;
    staticAttribute: EditableValue<string | Big | boolean | Date>;
    optionsSourceStaticDataSource: OptionsSourceStaticDataSourceType[];
    noOptionsText?: DynamicValue<string>;
    optionsSourceCustomContentType: OptionsSourceCustomContentTypeEnum;
    optionsSourceAssociationCustomContent?: ListWidgetValue;
    optionsSourceDatabaseCustomContent?: ListWidgetValue;
    controlType: ControlTypeEnum;
    groupName?: DynamicValue<string>;
    customEditability: CustomEditabilityEnum;
    customEditabilityExpression: DynamicValue<boolean>;
    readOnlyStyle: ReadOnlyStyleEnum;
    onChangeEvent?: ActionValue;
    ariaRequired: DynamicValue<boolean>;
    ariaLabel: string;
}

export interface CheckboxRadioSelectionPreviewProps {
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    source: SourceEnum;
    optionsSourceType: OptionsSourceTypeEnum;
    attributeEnumeration: string;
    attributeBoolean: string;
    optionsSourceDatabaseDataSource: {} | { caption: string } | { type: string } | null;
    optionsSourceDatabaseItemSelection: "Single" | "Multi" | "None";
    optionsSourceDatabaseValueAttribute: string;
    databaseAttributeString: string;
    attributeAssociation: string;
    optionsSourceAssociationDataSource: {} | { caption: string } | { type: string } | null;
    optionsSourceAssociationCaptionType: OptionsSourceAssociationCaptionTypeEnum;
    optionsSourceDatabaseCaptionType: OptionsSourceDatabaseCaptionTypeEnum;
    optionsSourceAssociationCaptionAttribute: string;
    optionsSourceDatabaseCaptionAttribute: string;
    optionsSourceAssociationCaptionExpression: string;
    optionsSourceDatabaseCaptionExpression: string;
    staticAttribute: string;
    optionsSourceStaticDataSource: OptionsSourceStaticDataSourcePreviewType[];
    noOptionsText: string;
    optionsSourceCustomContentType: OptionsSourceCustomContentTypeEnum;
    optionsSourceAssociationCustomContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    optionsSourceDatabaseCustomContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    controlType: ControlTypeEnum;
    groupName: string;
    customEditability: CustomEditabilityEnum;
    customEditabilityExpression: string;
    readOnlyStyle: ReadOnlyStyleEnum;
    onChangeEvent: {} | null;
    onChangeDatabaseEvent: {} | null;
    ariaRequired: string;
    ariaLabel: string;
}
