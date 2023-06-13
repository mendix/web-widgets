/**
 * This file was generated from Dropdown.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, EditableValue, ListValue, ListAttributeValue, ListExpressionValue, ReferenceValue, ReferenceSetValue } from "mendix";

export type OptionsSourceTypeEnum = "association" | "enumeration" | "boolean";

export type OptionsSourceAssociationCaptionTypeEnum = "attribute" | "expression";

export type FilterTypeEnum = "contains" | "startsWith" | "no";

export interface DropdownContainerProps {
    name: string;
    tabIndex?: number;
    id: string;
    optionsSourceType: OptionsSourceTypeEnum;
    attributeEnumerationOrBoolean: EditableValue<string | boolean>;
    attributeAssociation: ReferenceValue | ReferenceSetValue;
    optionsSourceAssociationDataSource?: ListValue;
    optionsSourceAssociationCaptionType: OptionsSourceAssociationCaptionTypeEnum;
    optionsSourceAssociationCaptionAttribute?: ListAttributeValue<string>;
    optionsSourceAssociationCaptionExpression?: ListExpressionValue<string>;
    emptyOptionText?: DynamicValue<string>;
    filterType: FilterTypeEnum;
    clearable: boolean;
    onClickEvent?: ActionValue;
    onEnterEvent?: ActionValue;
    onLeaveEvent?: ActionValue;
    ariaRequired: boolean;
}

export interface DropdownPreviewProps {
    readOnly: boolean;
    optionsSourceType: OptionsSourceTypeEnum;
    attributeEnumerationOrBoolean: string;
    attributeAssociation: string;
    optionsSourceAssociationDataSource: {} | { caption: string } | { type: string } | null;
    optionsSourceAssociationCaptionType: OptionsSourceAssociationCaptionTypeEnum;
    optionsSourceAssociationCaptionAttribute: string;
    optionsSourceAssociationCaptionExpression: string;
    emptyOptionText: string;
    filterType: FilterTypeEnum;
    clearable: boolean;
    onClickEvent: {} | null;
    onEnterEvent: {} | null;
    onLeaveEvent: {} | null;
    ariaRequired: boolean;
}
