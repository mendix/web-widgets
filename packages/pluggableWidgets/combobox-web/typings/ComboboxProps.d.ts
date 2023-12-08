/**
 * This file was generated from Combobox.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, ReactNode } from "react";
import { ActionValue, DynamicValue, EditableValue, ListValue, ListAttributeValue, ListExpressionValue, ListWidgetValue, ReferenceValue, ReferenceSetValue } from "mendix";

export type OptionsSourceTypeEnum = "association" | "enumeration" | "boolean";

export type OptionsSourceAssociationCaptionTypeEnum = "attribute" | "expression";

export type FilterTypeEnum = "contains" | "startsWith" | "none";

export type OptionsSourceAssociationCustomContentTypeEnum = "yes" | "listItem" | "no";

export type SelectionMethodEnum = "checkbox" | "rowclick";

export type SelectedItemsStyleEnum = "text" | "boxes";

export interface ComboboxContainerProps {
    name: string;
    tabIndex?: number;
    id: string;
    optionsSourceType: OptionsSourceTypeEnum;
    attributeEnumeration: EditableValue<string>;
    attributeBoolean: EditableValue<boolean>;
    attributeAssociation: ReferenceValue | ReferenceSetValue;
    optionsSourceAssociationDataSource?: ListValue;
    optionsSourceAssociationCaptionType: OptionsSourceAssociationCaptionTypeEnum;
    optionsSourceAssociationCaptionAttribute?: ListAttributeValue<string>;
    optionsSourceAssociationCaptionExpression?: ListExpressionValue<string>;
    emptyOptionText?: DynamicValue<string>;
    filterType: FilterTypeEnum;
    noOptionsText?: DynamicValue<string>;
    clearable: boolean;
    optionsSourceAssociationCustomContentType: OptionsSourceAssociationCustomContentTypeEnum;
    optionsSourceAssociationCustomContent?: ListWidgetValue;
    showFooter: boolean;
    menuFooterContent?: ReactNode;
    selectionMethod: SelectionMethodEnum;
    selectedItemsStyle: SelectedItemsStyleEnum;
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
    optionsSourceType: OptionsSourceTypeEnum;
    attributeEnumeration: string;
    attributeBoolean: string;
    attributeAssociation: string;
    optionsSourceAssociationDataSource: {} | { caption: string } | { type: string } | null;
    optionsSourceAssociationCaptionType: OptionsSourceAssociationCaptionTypeEnum;
    optionsSourceAssociationCaptionAttribute: string;
    optionsSourceAssociationCaptionExpression: string;
    emptyOptionText: string;
    filterType: FilterTypeEnum;
    noOptionsText: string;
    clearable: boolean;
    optionsSourceAssociationCustomContentType: OptionsSourceAssociationCustomContentTypeEnum;
    optionsSourceAssociationCustomContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    showFooter: boolean;
    menuFooterContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    selectionMethod: SelectionMethodEnum;
    selectedItemsStyle: SelectedItemsStyleEnum;
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
