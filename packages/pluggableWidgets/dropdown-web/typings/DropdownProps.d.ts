/**
 * This file was generated from Dropdown.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, EditableValue, ListValue, ListAttributeValue, ListExpressionValue, ReferenceValue, ReferenceSetValue } from "mendix";

export type OptionsSourceTypeEnum = "enumerationOrBoolean" | "association" | "custom";

export type OptionsSourceAssociationCaptionTypeEnum = "attribute" | "expression" | "custom";

export type TypeaheadEnum = "no" | "startsWith" | "contains";

export interface DropdownContainerProps {
    name: string;
    tabIndex?: number;
    id: string;
    optionsSourceType: OptionsSourceTypeEnum;
    attributeEnumerationOrBoolean?: EditableValue<string | boolean>;
    attributeAssociation?: ReferenceValue | ReferenceSetValue;
    optionsSourceAssociationDataSource?: ListValue;
    optionsSourceAssociationCaptionType: OptionsSourceAssociationCaptionTypeEnum;
    emptyOptionText: DynamicValue<string>;
    optionsSourceAssociationCaptionAttribute?: ListAttributeValue<string>;
    optionsSourceAssociationCaptionExpression?: ListExpressionValue<string>;
    typeahead: TypeaheadEnum;
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
    optionsSourceAssociationDataSource: {} | { type: string } | null;
    optionsSourceAssociationCaptionType: OptionsSourceAssociationCaptionTypeEnum;
    emptyOptionText: string;
    optionsSourceAssociationCaptionAttribute: string;
    optionsSourceAssociationCaptionExpression: string;
    typeahead: TypeaheadEnum;
    clearable: boolean;
    onClickEvent: {} | null;
    onEnterEvent: {} | null;
    onLeaveEvent: {} | null;
    ariaRequired: boolean;
}
