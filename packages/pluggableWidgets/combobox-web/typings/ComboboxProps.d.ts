/**
 * This file was generated from Combobox.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, EditableValue, ListValue, ListAttributeValue, ListExpressionValue, ReferenceValue, ReferenceSetValue } from "mendix";

export type OptionsSourceTypeEnum = "association" | "enumeration" | "boolean";

export type OptionsSourceAssociationCaptionTypeEnum = "attribute" | "expression";

export type FilterTypeEnum = "contains" | "startsWith" | "no";

export type SelectionTypeEnum = "checkbox" | "selectedTag";

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
    clearable: boolean;
    selectionType: SelectionTypeEnum;
    onClickEvent?: ActionValue;
    onEnterEvent?: ActionValue;
    onLeaveEvent?: ActionValue;
    ariaRequired: boolean;
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
    clearable: boolean;
    selectionType: SelectionTypeEnum;
    onClickEvent: {} | null;
    onEnterEvent: {} | null;
    onLeaveEvent: {} | null;
    ariaRequired: boolean;
}
